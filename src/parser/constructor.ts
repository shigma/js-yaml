import YAMLException from '../exception.ts'
import {
  EVENT_ALIAS,
  EVENT_DOCUMENT,
  EVENT_MAPPING,
  EVENT_POP,
  EVENT_SCALAR,
  EVENT_SEQUENCE,
  SCALAR_STYLE_PLAIN,
  type Event,
  type TagHandlers,
  type MappingEvent,
  type ScalarEvent,
  type SequenceEvent
} from './events.ts'
import { getScalarValue } from './parser_scalar.ts'
import { CORE_SCHEMA, type Schema } from '../schema.ts'
import {
  MERGE_KEY,
  NOT_RESOLVED,
  type MappingTagDefinition,
  type ScalarTagDefinition,
  type SequenceTagDefinition
} from '../tag.ts'
import { throwErrorAt, type ParserState } from './parser.ts'

const NO_RANGE = -1
const DEFAULT_TAG_HANDLES: Record<string, string> = {
  '!': '!',
  '!!': 'tag:yaml.org,2002:'
}

interface DocumentFrame {
  kind: 'document'
  position: number
  value: unknown
  hasValue: boolean
}

interface SequenceFrame {
  kind: 'sequence'
  position: number
  value: any
  tag: SequenceTagDefinition<any>
  index: number
  // True when this sequence is the source list of a `<<` merge (`<<: [...]`).
  // Each element is validated as a mapping on arrival; the materialized list is
  // then delivered to the target mapping, which folds the elements in.
  merge: boolean
}

interface MappingFrame {
  kind: 'mapping'
  position: number
  value: any
  tag: MappingTagDefinition<any>
  key: unknown
  keyPosition: number
  hasKey: boolean
  // Keys brought in by a merge that an explicit pair is still allowed to
  // override. Lazily allocated: stays null for mappings without `<<`.
  overridable: Set<unknown> | null
}

type Frame = DocumentFrame | SequenceFrame | MappingFrame

type AnyTag = ScalarTagDefinition | SequenceTagDefinition | MappingTagDefinition

interface Anchor {
  value: unknown
  tag: AnyTag
}

interface ConstructorOptions {
  filename?: string
  schema?: Schema
  json?: boolean
  maxMergeSeqLength?: number
}

const DEFAULT_CONSTRUCTOR_OPTIONS: Required<ConstructorOptions> = {
  filename: '',
  schema: CORE_SCHEMA,
  json: false,
  maxMergeSeqLength: 20
}

interface ConstructorState extends Required<ConstructorOptions> {
  parserState: ParserState
  documents: unknown[]
  eventIndex: number
  position: number
  frames: Frame[]
  anchors: Map<string, Anchor>
  tagHandlers: TagHandlers
}

function createConstructorState (parserState: ParserState, options: ConstructorOptions = {}): ConstructorState {
  return {
    ...DEFAULT_CONSTRUCTOR_OPTIONS,
    ...options,
    parserState,
    documents: [],
    eventIndex: 0,
    position: 0,
    frames: [],
    anchors: new Map(),
    tagHandlers: Object.create(null)
  }
}

function eventPosition (event: Event) {
  if ('tagStart' in event && event.tagStart !== NO_RANGE) return event.tagStart
  if ('anchorStart' in event && event.anchorStart !== NO_RANGE) return event.anchorStart
  if ('valueStart' in event && event.valueStart !== NO_RANGE) return event.valueStart
  if ('start' in event) return event.start
  return 0
}

function throwError (state: ConstructorState, message: string): never {
  throwErrorAt(state.parserState, state.position, message)
}

function callTag<T> (state: ConstructorState, callback: () => T): T {
  try {
    return callback()
  } catch (error) {
    if (error instanceof YAMLException) throw error
    throwError(state, error instanceof Error ? error.message : String(error))
  }
}

function resolveTagName (state: ConstructorState, rawTag: string) {
  if (rawTag.startsWith('!<') && rawTag.endsWith('>')) {
    try {
      return decodeURIComponent(rawTag.slice(2, -1))
    } catch {
      throwError(state, `tag name is malformed: ${rawTag}`)
    }
  }

  const match = /^(![\w-]*!|!)/.exec(rawTag)
  if (!match) throwError(state, `cannot resolve tag "${rawTag}"`)

  const handle = match[1]
  const prefix = state.tagHandlers[handle] ?? DEFAULT_TAG_HANDLES[handle] ?? handle

  try {
    return decodeURIComponent(prefix) + decodeURIComponent(rawTag.slice(handle.length))
  } catch {
    throwError(state, `tag name is malformed: ${rawTag}`)
  }
}

function lookupTag<T extends ScalarTagDefinition | SequenceTagDefinition | MappingTagDefinition> (
  exact: Record<string, T>,
  prefix: readonly T[],
  tagName: string
): T | undefined {
  const exactTag = exact[tagName]
  if (exactTag) return exactTag

  for (const tag of prefix) {
    if (tagName.startsWith(tag.tagName)) return tag
  }

  return undefined
}

function findExplicitTag<T extends ScalarTagDefinition | SequenceTagDefinition | MappingTagDefinition> (
  state: ConstructorState,
  exact: Record<string, T>,
  prefix: readonly T[],
  tagName: string,
  nodeKind: T['nodeKind']
) {
  const tag = lookupTag(exact, prefix, tagName)
  if (tag) return tag

  throwError(state, `unknown ${nodeKind} tag !<${tagName}>`)
}

function constructScalar (
  state: ConstructorState,
  event: ScalarEvent
): Anchor {
  const source = getScalarValue(state.parserState, event)
  const rawTag = event.tagStart === NO_RANGE
    ? ''
    : state.parserState.input.slice(event.tagStart, event.tagEnd)
  const strTag = state.schema.defaultScalarTag

  if (rawTag !== '') {
    if (rawTag === '!') return { value: source, tag: strTag }

    const tagName = resolveTagName(state, rawTag)
    const scalarTag = lookupTag(state.schema.exact.scalar, state.schema.prefix.scalar, tagName)

    if (scalarTag) {
      const result = scalarTag.resolve(source, tagName, true)

      if (result === NOT_RESOLVED) {
        throwError(state, `cannot resolve a node with !<${tagName}> explicit tag`)
      }

      return { value: result, tag: scalarTag }
    }

    // An empty node carrying a collection tag (e.g. `!!map`, `!!seq`) is emitted
    // by the parser as a scalar event, since there is no collection syntax to key
    // off. Resolve it here by the explicit tag's kind into an empty collection.
    const collectionTagDef =
      lookupTag(state.schema.exact.mapping, state.schema.prefix.mapping, tagName) ??
      lookupTag(state.schema.exact.sequence, state.schema.prefix.sequence, tagName)

    if (collectionTagDef) {
      if (source !== '') {
        throwError(state, `cannot resolve a node with !<${tagName}> explicit tag`)
      }

      return { value: collectionTagDef.create(tagName), tag: collectionTagDef }
    }

    throwError(state, `unknown scalar tag !<${tagName}>`)
  }

  if (event.style === SCALAR_STYLE_PLAIN) {
    // charAt(0) (not source[0]) yields '' for an empty source, which is the key
    // the null tag declares; source[0] would be undefined and miss that bucket.
    const candidates = state.schema.implicitScalarByFirstChar.get(source.charAt(0)) ??
      state.schema.implicitScalarAnyFirstChar
    for (const tag of candidates) {
      const result = tag.resolve(source, tag.tagName, false)
      if (result !== NOT_RESOLVED) return { value: result, tag }
    }
  }

  return { value: strTag.resolve(source, strTag.tagName, false), tag: strTag }
}

function collectionTag<Tag extends SequenceTagDefinition | MappingTagDefinition> (
  state: ConstructorState,
  event: SequenceEvent | MappingEvent,
  exact: Record<string, Tag>,
  prefix: readonly Tag[],
  defaultTagName: string,
  nodeKind: Tag['nodeKind']
) {
  const rawTag = event.tagStart === NO_RANGE
    ? ''
    : state.parserState.input.slice(event.tagStart, event.tagEnd)
  const tagName = rawTag === '' || rawTag === '!'
    ? defaultTagName
    : resolveTagName(state, rawTag)

  return {
    tagName,
    tag: findExplicitTag(state, exact, prefix, tagName, nodeKind)
  }
}

// A merge source must be a mapping; every mapping tag exposes the read side.
function isMappingTag (tag: AnyTag): tag is MappingTagDefinition<any> {
  return tag.nodeKind === 'mapping'
}

// Fold the keys of one mapping source into the target frame, honoring merge
// precedence: an already-present key (explicit or from an earlier source) wins.
function mergeKeys (state: ConstructorState, frame: MappingFrame, source: unknown, sourceTag: MappingTagDefinition<any>) {
  for (const sourceKey of sourceTag.keys(source)) {
    if (frame.tag.has(frame.value, sourceKey)) continue

    const err = frame.tag.addPair(frame.value, sourceKey, sourceTag.get(source, sourceKey))
    if (err) throwError(state, err)
    ;(frame.overridable ??= new Set()).add(sourceKey)
  }
}

// The value of a `<<` key: either a mapping (fold its keys) or a sequence of
// mappings (fold each). A merge sequence has already had every element validated
// as a mapping on arrival (see addValue), and its elements were built by the
// target's own mapping tag, so they are read back with it.
function mergeSource (state: ConstructorState, frame: MappingFrame, source: unknown, sourceTag: AnyTag) {
  state.position = frame.keyPosition

  if (isMappingTag(sourceTag)) {
    mergeKeys(state, frame, source, sourceTag)
  } else if (sourceTag.nodeKind === 'sequence' && Array.isArray(source)) {
    const seen = new Set<unknown>()
    for (const element of source) {
      // Dedup identical sources (`<<: [*a, *a]`); the first one wins anyway.
      if (seen.has(element)) continue
      seen.add(element)
      mergeKeys(state, frame, element, frame.tag)
    }
  } else {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable')
  }
}

function addMappingValue (state: ConstructorState, frame: MappingFrame, key: unknown, value: unknown, tag: AnyTag) {
  state.position = frame.keyPosition

  // `<<` is intercepted before dedup, so a repeated merge key is allowed.
  if (key === MERGE_KEY) {
    mergeSource(state, frame, value, tag)
    return
  }

  if (!state.json && frame.tag.has(frame.value, key) && !frame.overridable?.has(key)) {
    throwError(state, 'duplicated mapping key')
  }

  const err = frame.tag.addPair(frame.value, key, value)
  if (err) throwError(state, err)
  frame.overridable?.delete(key)
}

function addValue (state: ConstructorState, value: unknown, tag: AnyTag) {
  const frame = state.frames[state.frames.length - 1]

  if (!frame) throwError(state, 'node appears outside a document')

  if (frame.kind === 'document') {
    if (frame.hasValue) throwError(state, 'document contains more than one root node')
    frame.value = value
    frame.hasValue = true
  } else if (frame.kind === 'sequence') {
    if (frame.merge) {
      // Element of a `<<: [...]` list: validate it is a mapping and cap the
      // length, then collect it like any other item for the target to fold in.
      if (!isMappingTag(tag)) {
        throwError(state, 'cannot merge mappings; the provided source object is unacceptable')
      }
      if (frame.index >= state.maxMergeSeqLength) {
        throwError(state, `merge sequence length exceeded maxMergeSeqLength (${state.maxMergeSeqLength})`)
      }
    }
    frame.tag.addItem(frame.value, value, frame.index++)
  } else if (frame.hasKey) {
    const key = frame.key
    frame.key = undefined
    frame.hasKey = false
    addMappingValue(state, frame, key, value, tag)
  } else {
    frame.key = value
    frame.keyPosition = state.position
    frame.hasKey = true
  }
}

function storeAnchor (state: ConstructorState, event: ScalarEvent | SequenceEvent | MappingEvent, value: unknown, tag: AnyTag) {
  if (event.anchorStart !== NO_RANGE) {
    state.anchors.set(state.parserState.input.slice(event.anchorStart, event.anchorEnd), { value, tag })
  }
}

function constructEvents (state: ConstructorState) {
  while (state.eventIndex < state.parserState.events.length) {
    const event = state.parserState.events[state.eventIndex++]
    state.position = eventPosition(event)

    switch (event.type) {
      case EVENT_DOCUMENT:
        state.anchors = new Map()
        state.tagHandlers = Object.create(null)
        for (const directive of event.directives) {
          if (directive.kind === 'tag') state.tagHandlers[directive.handle] = directive.prefix
        }
        state.frames.push({ kind: 'document', position: state.position, value: undefined, hasValue: false })
        break

      case EVENT_SCALAR: {
        const { value, tag } = constructScalar(state, event)
        storeAnchor(state, event, value, tag)
        addValue(state, value, tag)
        break
      }

      case EVENT_SEQUENCE: {
        const definition = collectionTag(
          state,
          event,
          state.schema.exact.sequence,
          state.schema.prefix.sequence,
          'tag:yaml.org,2002:seq',
          'sequence'
        )
        const value = definition.tag.create(definition.tagName)
        storeAnchor(state, event, value, definition.tag)

        // `<<: [...]` — the parent mapping is waiting on a merge key, so this
        // sequence is a list of merge sources: its elements must be mappings.
        // It is still built and delivered as a normal value; the target folds it.
        const parent = state.frames[state.frames.length - 1]
        const merge = parent !== undefined && parent.kind === 'mapping' &&
          parent.hasKey && parent.key === MERGE_KEY

        state.frames.push({
          kind: 'sequence', position: state.position, value, tag: definition.tag, index: 0, merge
        })
        break
      }

      case EVENT_MAPPING: {
        const definition = collectionTag(
          state,
          event,
          state.schema.exact.mapping,
          state.schema.prefix.mapping,
          'tag:yaml.org,2002:map',
          'mapping'
        )
        const value = definition.tag.create(definition.tagName)
        storeAnchor(state, event, value, definition.tag)
        state.frames.push({
          kind: 'mapping',
          position: state.position,
          value,
          tag: definition.tag,
          key: undefined,
          keyPosition: state.position,
          hasKey: false,
          overridable: null
        })
        break
      }

      case EVENT_ALIAS: {
        const name = event.anchorStart === NO_RANGE
          ? ''
          : state.parserState.input.slice(event.anchorStart, event.anchorEnd)
        const anchor = state.anchors.get(name)
        if (!anchor) {
          throwError(state, `unidentified alias "${name}"`)
        }
        addValue(state, anchor.value, anchor.tag)
        break
      }

      case EVENT_POP: {
        const frame = state.frames.pop()
        if (!frame) throwError(state, 'unexpected collection end')

        if (frame.kind === 'document') {
          state.documents.push(frame.value)
        } else {
          state.position = frame.position
          if (frame.kind === 'mapping' && frame.hasKey) {
            throwError(state, 'mapping contains a key without a value')
          }
          if (frame.tag.finish) callTag(state, () => frame.tag.finish!(frame.value))
          addValue(state, frame.value, frame.tag)
        }
        break
      }
    }
  }

  if (state.frames.length !== 0) throwError(state, 'unexpected end of event stream')
}

function constructDocuments (parserState: ParserState, options: ConstructorOptions = {}) {
  const state = createConstructorState(parserState, options)
  constructEvents(state)
  return state.documents
}

export {
  createConstructorState,
  constructEvents,
  constructDocuments,
  type ConstructorOptions,
  type ConstructorState
}
