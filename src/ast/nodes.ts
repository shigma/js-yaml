// Plain-object discriminated union shared by the dumper (built by `jsToAst`,
// rendered by the presenter) and, later, by load. Behaviour lives in the walkers,
// not on the nodes.

class Style {
  tagged = false
  flow = false
  singleQuoted = false
  doubleQuoted = false
  literal = false
  folded = false
}

interface NodeBase {
  // Semantic YAML tag. Whether to print it explicitly lives in `style.tagged`.
  tag: string
  style: Style
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
}

interface SequenceNode extends NodeBase {
  kind: 'sequence'
  items: Node[]
}

interface MappingNode extends NodeBase {
  kind: 'mapping'
  items: Array<{ key: Node, value: Node }>
}

interface AliasNode extends NodeBase {
  kind: 'alias'
  // The anchor name this alias points at (`*name`).
  anchor: string
}

type Node = ScalarNode | SequenceNode | MappingNode | AliasNode

// The layer above `Node`: a stream is a list of documents, each wrapping one
// content node plus its own markers/directives. Not a member of `Node` — the
// fields differ. Document directives are data slots; `%TAG` emission is not
// implemented by the dumper yet.
interface Document {
  contents: Node | null            // null = empty document
  explicitStart?: boolean          // print '---'
  explicitEnd?: boolean            // print '...'
  version?: string | null
  tagHandles?: Array<{ handle: string, prefix: string }>
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
  Style,
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
  type AliasNode
}
