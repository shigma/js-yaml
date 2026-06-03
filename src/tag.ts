const NODE_KIND_UNKNOWN = 0
const NODE_KIND_SCALAR = 1
const NODE_KIND_SEQUENCE = 2
const NODE_KIND_MAPPING = 3

type NodeKind = typeof NODE_KIND_SCALAR | typeof NODE_KIND_SEQUENCE | typeof NODE_KIND_MAPPING
type NodeKindString = 'scalar' | 'sequence' | 'mapping'
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

interface PartialTagDefinition {
  nodeKind: NodeKind | NodeKindString
  matchByTagPrefix?: boolean
  resolve?: (data: any, tag?: string) => boolean
  construct?: (data: any, type?: string) => any
  predicate?: ((data: object) => boolean) | null
  represent?: RepresentFn | { [style: string]: RepresentFn } | null
  representTagName?: ((data: object) => any) | null
  defaultStyle?: string | null
  styleAliases?: { [style: string]: string[] } | null
}

interface TagDefinition extends Required<Omit<PartialTagDefinition, 'nodeKind' | 'styleAliases'>> {
  tagName: string
  nodeKind: NodeKind
  styleAliases: { [alias: string]: string }
}

const DEFAULT_TAG_DEFINITION: Required<Omit<PartialTagDefinition, 'nodeKind'>> = {
  matchByTagPrefix: false,
  resolve: () => true,
  construct: (data: any) => data,
  predicate: null,
  represent: null,
  representTagName: null,
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

function toNumericNodeKind (kind: NodeKind | NodeKindString): NodeKind {
  switch (kind) {
    case NODE_KIND_SCALAR:
    case 'scalar': return NODE_KIND_SCALAR
    case NODE_KIND_SEQUENCE:
    case 'sequence': return NODE_KIND_SEQUENCE
    case NODE_KIND_MAPPING:
    case 'mapping': return NODE_KIND_MAPPING
    default: throw new Error(`Unknown node kind "${kind}"`)
  }
}

function defineTag (tagName: string, options: PartialTagDefinition): TagDefinition {
  const opts = { ...DEFAULT_TAG_DEFINITION, ...options }

  // TODO: Add tag format check.
  return {
    tagName,
    nodeKind: toNumericNodeKind(opts.nodeKind),
    resolve: opts.resolve,
    construct: opts.construct,
    predicate: opts.predicate,
    represent: opts.represent,
    representTagName: opts.representTagName,
    defaultStyle: opts.defaultStyle,
    matchByTagPrefix: opts.matchByTagPrefix,
    styleAliases: compileStyleAliases(opts.styleAliases)
  }
}

export {
  defineTag,
  NODE_KIND_UNKNOWN,
  NODE_KIND_SCALAR,
  NODE_KIND_SEQUENCE,
  NODE_KIND_MAPPING,
  nodeKindToString,

  type NodeKind,
  type NodeKindString,
  type NodeKindOrUnknown,
  type PartialTagDefinition,
  type TagDefinition
}
