import { YAML11_SCHEMA, type Schema } from './schema.ts'
import { jsToAst } from './ast/from_js.ts'
import { visit, VISIT_SKIP } from './ast/visit.ts'
import {
  DEFAULT_PRESENTER_OPTIONS,
  present,
  type PresenterOptions
} from './ast/presenter.ts'
import { pick } from './common/object.ts'
import { NOT_RESOLVED } from './tag.ts'
import { intCoreTag } from './tag/scalar/int_core.ts'
import { intYaml11Tag } from './tag/scalar/int_yaml11.ts'
import { floatCoreTag } from './tag/scalar/float_core.ts'
import { floatYaml11Tag } from './tag/scalar/float_yaml11.ts'

interface DumpOptions extends Omit<PresenterOptions, 'schema'> {
  schema?: Schema
  skipInvalid?: boolean
  noRefs?: boolean
  flowLevel?: number
}

// YAML 1.1 misses YAML 1.2 `0o...` ints and exponent-only floats.
// Combine resolvers so all possible collisions are quoted.
const DEFAULT_DUMP_SCHEMA = YAML11_SCHEMA.withTags(
  {
    ...intYaml11Tag,
    resolve: (source, isExplicit, tagName) => {
      const result = intYaml11Tag.resolve(source, isExplicit, tagName)
      return result === NOT_RESOLVED ? intCoreTag.resolve(source, isExplicit, tagName) : result
    }
  },
  {
    ...floatYaml11Tag,
    resolve: (source, isExplicit, tagName) => {
      const result = floatYaml11Tag.resolve(source, isExplicit, tagName)
      return result === NOT_RESOLVED ? floatCoreTag.resolve(source, isExplicit, tagName) : result
    }
  }
)

const DEFAULT_DUMP_OPTIONS: Required<DumpOptions> = {
  ...DEFAULT_PRESENTER_OPTIONS,
  schema: DEFAULT_DUMP_SCHEMA,
  skipInvalid: false,
  noRefs: false,
  flowLevel: -1
}

// Options that need the JS value (tags, format, dedup) go to `jsToAst`; purely
// presentational ones go to `present`.
function dump (input: any, options: DumpOptions = {}) {
  const opts = { ...DEFAULT_DUMP_OPTIONS, ...options }

  const contents = jsToAst(input, opts.schema, {
    noRefs: opts.noRefs,
    skipInvalid: opts.skipInvalid
  })

  // Wrap the content node into a single-document array. With empty document
  // fields this prints no markers — byte-for-byte the v4 output (and '' when
  // the root didn't resolve, since an empty document renders nothing).
  const documents = [{ contents, directives: [] }]

  // flowLevel: every node at this depth switches to flow; the presenter forces
  // everything below into flow too, so the walk stops there.
  if (opts.flowLevel >= 0) {
    visit(documents, (node, ctx) => {
      if (ctx.depth < opts.flowLevel) return
      node.style.flow = true
      return VISIT_SKIP
    })
  }

  const PRESENTER_OPT_KEYS = Object.keys(DEFAULT_PRESENTER_OPTIONS) as
    (keyof typeof DEFAULT_PRESENTER_OPTIONS)[]

  return present(documents, { ...pick(opts, PRESENTER_OPT_KEYS), schema: opts.schema })
}

export {
  dump,

  type DumpOptions
}
