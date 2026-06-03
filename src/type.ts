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

type RepresentFn = (data: any, style?: string) => any

interface TypePartial {
  nodeKind: NodeKind
  multi?: boolean
  resolve?: (data: any, tag?: string) => boolean
  construct?: (data: any, type?: string) => any
  predicate?: ((data: object) => boolean) | null
  represent?: RepresentFn | { [style: string]: RepresentFn } | null
  representName?: ((data: object) => any) | null
  defaultStyle?: string | null
  styleAliases?: { [style: string]: string[] } | null
}

interface Type extends Required<Omit<TypePartial, 'styleAliases'>> {
  tag: string
  styleAliases: { [alias: string]: string }
}

const DEFAULT_TYPE_OPTIONS: Required<Omit<TypePartial, 'nodeKind'>> = {
  multi: false,
  resolve: () => true,
  construct: (data: any) => data,
  predicate: null,
  represent: null,
  representName: null,
  defaultStyle: null,
  styleAliases: null
}

function compileStyleAliases (map: { [style: string]: string[] } | null) {
  const result: { [alias: string]: string } = {}

  if (map !== null) {
    Object.keys(map).forEach((style) => {
      map[style].forEach((alias) => {
        result[alias] = style
      })
    })
  }

  return result
}

function createType (tag: string, options: TypePartial): Type {
  const opts = { ...DEFAULT_TYPE_OPTIONS, ...options }

  // TODO: Add tag format check.
  return {
    tag,
    nodeKind: opts.nodeKind,
    resolve: opts.resolve,
    construct: opts.construct,
    predicate: opts.predicate,
    represent: opts.represent,
    representName: opts.representName,
    defaultStyle: opts.defaultStyle,
    multi: opts.multi,
    styleAliases: compileStyleAliases(opts.styleAliases)
  }
}

export {
  createType,
  NODE_KIND_UNKNOWN,
  NODE_KIND_SCALAR,
  NODE_KIND_SEQUENCE,
  NODE_KIND_MAPPING,
  nodeKindToString
}
export type { NodeKind, NodeKindOrUnknown, TypePartial, Type }
