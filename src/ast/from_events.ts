// Parser events → AST. The second entry into the AST world (the first being
// `jsToAst`): instead of building JS values like the constructor, it mirrors the
// same document/sequence/mapping frame walk and emits `Node`s that keep the
// original styles, tags and anchors, so parsed YAML can be re-dumped faithfully.

import {
  EVENT_ALIAS,
  EVENT_DOCUMENT,
  EVENT_MAPPING,
  EVENT_POP,
  EVENT_SCALAR,
  EVENT_SEQUENCE,
  SCALAR_STYLE_PLAIN,
  SCALAR_STYLE_SINGLE_QUOTED,
  SCALAR_STYLE_DOUBLE_QUOTED,
  SCALAR_STYLE_LITERAL_BLOCK,
  SCALAR_STYLE_FOLDED_BLOCK,
  COLLECTION_STYLE_FLOW,
  type Event,
  type MappingEvent,
  type ScalarEvent,
  type SequenceEvent
} from '../parser/events.ts'
import { getScalarValue } from '../parser/parser_scalar.ts'
import { type ParserState } from '../parser/parser.ts'
import { type Schema } from '../schema.ts'
import { NOT_RESOLVED } from '../tag.ts'
import {
  Style,
  type Node,
  type Document,
  type ScalarNode,
  type SequenceNode,
  type MappingNode,
  type AliasNode
} from './nodes.ts'

const NO_RANGE = -1

interface DocumentFrame {
  kind: 'document'
  doc: Document
}

interface SequenceFrame {
  kind: 'sequence'
  node: SequenceNode
}

interface MappingFrame {
  kind: 'mapping'
  node: MappingNode
  key: Node | null
}

type Frame = DocumentFrame | SequenceFrame | MappingFrame

interface FromEventsOptions {
  schema: Schema
}

interface FromEventsState {
  parserState: ParserState
  schema: Schema
  eventIndex: number
  position: number
  frames: Frame[]
  documents: Document[]
}

function eventPosition (event: Event) {
  if ('tagStart' in event && event.tagStart !== NO_RANGE) return event.tagStart
  if ('anchorStart' in event && event.anchorStart !== NO_RANGE) return event.anchorStart
  if ('valueStart' in event && event.valueStart !== NO_RANGE) return event.valueStart
  if ('start' in event) return event.start
  return 0
}

function rawTag (state: FromEventsState, event: ScalarEvent | SequenceEvent | MappingEvent) {
  return event.tagStart === NO_RANGE
    ? ''
    : state.parserState.input.slice(event.tagStart, event.tagEnd)
}

function anchorName (state: FromEventsState, event: ScalarEvent | SequenceEvent | MappingEvent) {
  return event.anchorStart === NO_RANGE
    ? undefined
    : state.parserState.input.slice(event.anchorStart, event.anchorEnd)
}

// Tag name carried by an empty/plain scalar with no explicit tag: the first
// implicit scalar resolver that accepts the text, falling back to str. Mirrors
// the implicit branch of `constructScalar`, but we only want the tag name.
function implicitScalarTagName (state: FromEventsState, source: string) {
  const { schema } = state
  const candidates = schema.implicitScalarByFirstChar.get(source.charAt(0)) ??
    schema.implicitScalarAnyFirstChar
  for (const tag of candidates) {
    if (tag.resolve(source, tag.tagName, false) !== NOT_RESOLVED) return tag.tagName
  }
  return schema.defaultScalarTag.tagName
}

function buildScalar (state: FromEventsState, event: ScalarEvent): ScalarNode {
  const value = getScalarValue(state.parserState, event)
  const raw = rawTag(state, event)
  const style = new Style()

  switch (event.style) {
    case SCALAR_STYLE_SINGLE_QUOTED: style.singleQuoted = true; break
    case SCALAR_STYLE_DOUBLE_QUOTED: style.doubleQuoted = true; break
    case SCALAR_STYLE_LITERAL_BLOCK: style.literal = true; break
    case SCALAR_STYLE_FOLDED_BLOCK: style.folded = true; break
  }

  let tag: string
  if (raw !== '') {
    style.tagged = true
    tag = raw
  } else if (event.style === SCALAR_STYLE_PLAIN) {
    tag = implicitScalarTagName(state, value)
  } else {
    tag = state.schema.defaultScalarTag.tagName
  }

  return { kind: 'scalar', tag, style, anchor: anchorName(state, event), value }
}

function buildCollection (
  state: FromEventsState,
  event: SequenceEvent | MappingEvent,
  defaultTagName: string
): { tag: string, style: Style, anchor?: string } {
  const raw = rawTag(state, event)
  const style = new Style()
  if (event.style === COLLECTION_STYLE_FLOW) style.flow = true

  let tag: string
  if (raw === '') {
    tag = defaultTagName
  } else {
    tag = raw
    style.tagged = true
  }

  return { tag, style, anchor: anchorName(state, event) }
}

function addNode (state: FromEventsState, node: Node) {
  const frame = state.frames[state.frames.length - 1]

  if (frame.kind === 'document') {
    frame.doc.contents = node
  } else if (frame.kind === 'sequence') {
    frame.node.items.push(node)
  } else if (frame.key) {
    frame.node.items.push({ key: frame.key, value: node })
    frame.key = null
  } else {
    frame.key = node
  }
}

function eventsToAst (parserState: ParserState, options: FromEventsOptions): Document[] {
  const state: FromEventsState = {
    parserState,
    schema: options.schema,
    eventIndex: 0,
    position: 0,
    frames: [],
    documents: []
  }

  while (state.eventIndex < parserState.events.length) {
    const event = parserState.events[state.eventIndex++]
    state.position = eventPosition(event)

    switch (event.type) {
      case EVENT_DOCUMENT: {
        const doc: Document = {
          contents: null,
          explicitStart: event.explicitStart,
          explicitEnd: event.explicitEnd,
          directives: event.directives
        }
        state.frames.push({ kind: 'document', doc })
        break
      }

      case EVENT_SCALAR:
        addNode(state, buildScalar(state, event))
        break

      case EVENT_SEQUENCE: {
        const { tag, style, anchor } = buildCollection(state, event, 'tag:yaml.org,2002:seq')
        const node: SequenceNode = { kind: 'sequence', tag, style, anchor, items: [] }
        state.frames.push({ kind: 'sequence', node })
        break
      }

      case EVENT_MAPPING: {
        const { tag, style, anchor } = buildCollection(state, event, 'tag:yaml.org,2002:map')
        const node: MappingNode = { kind: 'mapping', tag, style, anchor, items: [] }
        state.frames.push({ kind: 'mapping', node, key: null })
        break
      }

      case EVENT_ALIAS: {
        const name = parserState.input.slice(event.anchorStart, event.anchorEnd)
        const node: AliasNode = { kind: 'alias', tag: '', style: new Style(), anchor: name }
        addNode(state, node)
        break
      }

      case EVENT_POP: {
        const frame = state.frames.pop()!
        if (frame.kind === 'document') {
          state.documents.push(frame.doc)
        } else {
          addNode(state, frame.node)
        }
        break
      }
    }
  }

  return state.documents
}

export {
  eventsToAst,
  type FromEventsOptions
}
