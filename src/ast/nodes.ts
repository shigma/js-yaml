// Plain-object discriminated union shared by the dumper (built by `jsToAst`,
// rendered by `present`) and, later, by load. Behaviour lives in the walkers,
// not on the nodes.

// Stored in `tag` when the tag is implicit (not printed).
const IMPLICIT = '?'

type ScalarStyle = 'plain' | 'single' | 'double' | 'literal' | 'folded'
type CollectionStyle = 'block' | 'flow'

interface NodeBase {
  tag: string
  anchor?: string

  // Reserved for the formatting layer; not populated by the dumper yet.
  commentBefore?: string
  comment?: string
  commentAfter?: string
  blankBefore?: number
}

interface ScalarNode extends NodeBase {
  kind: 'scalar'
  value: string
  // When unset, `present` picks the style from content/width.
  style?: ScalarStyle
}

interface SequenceNode extends NodeBase {
  kind: 'sequence'
  items: Node[]
  style?: CollectionStyle
}

interface MappingNode extends NodeBase {
  kind: 'mapping'
  items: Array<{ key: Node, value: Node }>
  style?: CollectionStyle
}

interface AliasNode extends NodeBase {
  kind: 'alias'
  // The anchor name this alias points at (`*name`).
  anchor: string
}

type Node = ScalarNode | SequenceNode | MappingNode | AliasNode

// The layer above `Node`: a stream is a list of documents, each wrapping one
// content node plus its own markers/directives. Not a member of `Node` — the
// fields differ. `explicitStart`/`explicitEnd`/`directives` are data slots,
// unset by the dumper today (a stub, not a feature); `directives` isn't emitted.
interface Document {
  contents: Node | null            // null = empty document
  explicitStart?: boolean          // print '---'
  explicitEnd?: boolean            // print '...'
  directives?: { yaml?: string, tags?: Record<string, string> }
}

type Stream = Document[]

function isScalar (node: Node): node is ScalarNode {
  return node.kind === 'scalar'
}

function isSequence (node: Node): node is SequenceNode {
  return node.kind === 'sequence'
}

function isMapping (node: Node): node is MappingNode {
  return node.kind === 'mapping'
}

function isAlias (node: Node): node is AliasNode {
  return node.kind === 'alias'
}

export {
  IMPLICIT,
  isScalar,
  isSequence,
  isMapping,
  isAlias,

  type Node,
  type Document,
  type Stream,
  type NodeBase,
  type ScalarNode,
  type SequenceNode,
  type MappingNode,
  type AliasNode,
  type ScalarStyle,
  type CollectionStyle
}
