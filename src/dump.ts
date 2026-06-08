import { YAML11_SCHEMA, type Schema } from './schema.ts'
import { jsToAst } from './ast/js_to_ast.ts'
import { present } from './ast/present.ts'

interface DumpOptions {
  schema?: Schema
  indent?: number
  noArrayIndent?: boolean
  skipInvalid?: boolean
  flowLevel?: number
  styles?: { [tag: string]: string } | null
  sortKeys?: boolean | ((a: any, b: any) => number)
  lineWidth?: number
  noRefs?: boolean
  noCompatMode?: boolean
  condenseFlow?: boolean
  quotingType?: "'" | '"'
  forceQuotes?: boolean
}

const DEFAULT_DUMP_OPTIONS: Required<DumpOptions> = {
  schema: YAML11_SCHEMA,
  indent: 2,
  noArrayIndent: false,
  skipInvalid: false,
  flowLevel: -1,
  styles: null,
  sortKeys: false,
  lineWidth: 80,
  noRefs: false,
  noCompatMode: false,
  condenseFlow: false,
  quotingType: "'",
  forceQuotes: false
}

// Options that need the JS value (tags, format, dedup) go to `jsToAst`; purely
// presentational ones go to `present`.
function dump (input: any, options: DumpOptions = {}) {
  const opts = { ...DEFAULT_DUMP_OPTIONS, ...options }

  const ast = jsToAst(input, opts.schema, {
    styles: opts.styles,
    noRefs: opts.noRefs,
    skipInvalid: opts.skipInvalid
  })

  if (ast === null) return ''

  return present(ast, {
    schema: opts.schema,
    indent: opts.indent,
    noArrayIndent: opts.noArrayIndent,
    flowLevel: opts.flowLevel,
    sortKeys: opts.sortKeys,
    lineWidth: opts.lineWidth,
    noCompatMode: opts.noCompatMode,
    condenseFlow: opts.condenseFlow,
    quotingType: opts.quotingType,
    forceQuotes: opts.forceQuotes
  }) + '\n'
}

export {
  dump,

  type DumpOptions
}
