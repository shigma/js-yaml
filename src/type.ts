const NODE_KIND_UNKNOWN = 0
const NODE_KIND_SCALAR = 1
const NODE_KIND_SEQUENCE = 2
const NODE_KIND_MAPPING = 3

type NodeKind = typeof NODE_KIND_SCALAR | typeof NODE_KIND_SEQUENCE | typeof NODE_KIND_MAPPING
type NodeKindOrUnknown = typeof NODE_KIND_UNKNOWN | NodeKind

function nodeKindToString (kind: NodeKindOrUnknown) {
  switch (kind) {
    case NODE_KIND_SCALAR: return 'scalar'
    case NODE_KIND_SEQUENCE: return 'sequence'
    case NODE_KIND_MAPPING: return 'mapping'
    case NODE_KIND_UNKNOWN: return 'unknown'
  }
}

type StyleAlias = string | number

type RepresentFn = (data: any, style?: string) => any

interface TypeOptions {
  nodeKind: NodeKind
  multi?: boolean
  resolve?: (data: any, tag?: string) => boolean
  construct?: (data: any, type?: string) => any
  predicate?: ((data: object) => boolean) | null
  represent?: RepresentFn | { [style: string]: RepresentFn } | null
  representName?: ((data: object) => any) | null
  defaultStyle?: string | null
  styleAliases?: { [style: string]: StyleAlias[] } | null
}

const DEFAULT_TYPE_OPTIONS: Required<Omit<TypeOptions, 'nodeKind'>> = {
  multi: false,
  resolve: () => true,
  construct: (data: any) => data,
  predicate: null,
  represent: null,
  representName: null,
  defaultStyle: null,
  styleAliases: null
}

function compileStyleAliases (map: { [style: string]: StyleAlias[] } | null) {
  const result: { [alias: string]: string } = {}

  if (map !== null) {
    Object.keys(map).forEach((style) => {
      map[style].forEach((alias) => {
        result[String(alias)] = style
      })
    })
  }

  return result
}

class Type {
  options: TypeOptions
  tag: string
  nodeKind: NodeKind
  resolve: (data: any, tag?: string) => boolean
  construct: (data: any, type?: string) => any
  predicate: ((data: object) => boolean) | null
  represent: RepresentFn | { [style: string]: RepresentFn } | null
  representName: ((data: object) => any) | null
  defaultStyle: string | null
  multi: boolean
  styleAliases: { [alias: string]: string }

  constructor (tag: string, options: TypeOptions) {
    const opts = { ...DEFAULT_TYPE_OPTIONS, ...options }

    // TODO: Add tag format check.
    this.options = options // keep original options in case user wants to extend this type later
    this.tag = tag
    this.nodeKind = opts.nodeKind
    this.resolve = opts.resolve
    this.construct = opts.construct
    this.predicate = opts.predicate
    this.represent = opts.represent
    this.representName = opts.representName
    this.defaultStyle = opts.defaultStyle
    this.multi = opts.multi
    this.styleAliases = compileStyleAliases(opts.styleAliases)
  }
}

export {
  Type,
  NODE_KIND_UNKNOWN,
  NODE_KIND_SCALAR,
  NODE_KIND_SEQUENCE,
  NODE_KIND_MAPPING,
  nodeKindToString
}
export type { StyleAlias, NodeKind, NodeKindOrUnknown, TypeOptions }
