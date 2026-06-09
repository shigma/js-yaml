import { YAML11_SCHEMA, type Schema } from './schema.ts'
import { jsToAst } from './ast/js_to_ast.ts'
import { present } from './ast/present.ts'
import { NOT_RESOLVED } from './tag.ts'
import { intCoreTag } from './tag/scalar/int_core.ts'
import { intYaml11Tag } from './tag/scalar/int_yaml11.ts'
import { floatCoreTag } from './tag/scalar/float_core.ts'
import { floatYaml11Tag } from './tag/scalar/float_yaml11.ts'

interface DumpOptions {
  schema?: Schema
  indent?: number
  noArrayIndent?: boolean
  skipInvalid?: boolean
  flowLevel?: number
  sortKeys?: boolean | ((a: any, b: any) => number)
  lineWidth?: number
  noRefs?: boolean
  condenseFlow?: boolean
  quotingType?: "'" | '"'
  forceQuotes?: boolean
}

// YAML 1.1 misses YAML 1.2 `0o...` ints and exponent-only floats.
// Combine resolvers so all possible collisions are quoted.
const DEFAULT_DUMP_SCHEMA = YAML11_SCHEMA.withTags(
  {
    ...intYaml11Tag,
    resolve: (source, tagName, isExplicit) => {
      const result = intYaml11Tag.resolve(source, tagName, isExplicit)
      return result === NOT_RESOLVED ? intCoreTag.resolve(source, tagName, isExplicit) : result
    }
  },
  {
    ...floatYaml11Tag,
    resolve: (source, tagName, isExplicit) => {
      const result = floatYaml11Tag.resolve(source, tagName, isExplicit)
      return result === NOT_RESOLVED ? floatCoreTag.resolve(source, tagName, isExplicit) : result
    }
  }
)

const DEFAULT_DUMP_OPTIONS: Required<DumpOptions> = {
  schema: DEFAULT_DUMP_SCHEMA,
  indent: 2,
  noArrayIndent: false,
  skipInvalid: false,
  flowLevel: -1,
  sortKeys: false,
  lineWidth: 80,
  noRefs: false,
  condenseFlow: false,
  quotingType: "'",
  forceQuotes: false
}

// Options that need the JS value (tags, format, dedup) go to `jsToAst`; purely
// presentational ones go to `present`.
function dump (input: any, options: DumpOptions = {}) {
  const opts = { ...DEFAULT_DUMP_OPTIONS, ...options }

  const contents = jsToAst(input, opts.schema, {
    noRefs: opts.noRefs,
    skipInvalid: opts.skipInvalid
  })

  // Wrap the content node into a single-document stream. With empty document
  // fields this prints no markers — byte-for-byte the v4 output (and '' when
  // the root didn't resolve, since an empty document renders nothing).
  return present([{ contents }], {
    schema: opts.schema,
    indent: opts.indent,
    noArrayIndent: opts.noArrayIndent,
    flowLevel: opts.flowLevel,
    sortKeys: opts.sortKeys,
    lineWidth: opts.lineWidth,
    condenseFlow: opts.condenseFlow,
    quotingType: opts.quotingType,
    forceQuotes: opts.forceQuotes
  })
}

export {
  dump,

  type DumpOptions
}
