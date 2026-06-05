import YAMLException from './exception.ts'
import {
  EVENT_ALIAS,
  EVENT_DOCUMENT,
  EVENT_MAPPING,
  EVENT_POP,
  EVENT_SCALAR,
  EVENT_SEQUENCE,
  SCALAR_STYLE_PLAIN,
  type Event,
  type MappingEvent,
  type ScalarEvent,
  type SequenceEvent
} from './events.ts'
import { getScalarValue } from './scalar.ts'
import { CORE_SCHEMA, type Schema } from './schema.ts'
import {
  MERGE_KEY,
  NOT_RESOLVED,
  type MappingTagDefinition,
  type ScalarTagDefinition,
  type SequenceTagDefinition
} from './tag.ts'
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
}

interface MappingFrame {
  kind: 'mapping'
  position: number
  value: any
  tag: MappingTagDefinition<any>
  key: unknown
  keyPosition: number
  hasKey: boolean
  keys: Set<string>
  overridableKeys: Set<string>
}

type Frame = DocumentFrame | SequenceFrame | MappingFrame

interface ConstructOptions {
  filename?: string
  schema?: Schema
  json?: boolean
  maxMergeSeqLength?: number
}

const DEFAULT_CONSTRUCT_OPTIONS: Required<ConstructOptions> = {
  filename: '',
  schema: CORE_SCHEMA,
  json: false,
  maxMergeSeqLength: 20
}

interface ConstructorState extends Required<ConstructOptions> {
  parserState: ParserState
  documents: unknown[]
  eventIndex: number
  position: number
  frames: Frame[]
  anchors: Map<string, unknown>
  tagDirectives: Record<string, string>
}

function createConstructorState (parserState: ParserState, options: ConstructOptions = {}): ConstructorState {
  return {
    ...DEFAULT_CONSTRUCT_OPTIONS,
    ...options,
    parserState,
    documents: [],
    eventIndex: 0,
    position: 0,
    frames: [],
    anchors: new Map(),
    tagDirectives: Object.create(null)
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
  if (rawTag.startsWith('!<') && rawTag.endsWith('>')) return rawTag.slice(2, -1)

  const match = /^(![\w-]*!|!)/.exec(rawTag)
  if (!match) throwError(state, `cannot resolve tag "${rawTag}"`)

  const handle = match[1]
  const prefix = state.tagDirectives[handle] ?? DEFAULT_TAG_HANDLES[handle] ?? handle

  try {
    return prefix + decodeURIComponent(rawTag.slice(handle.length))
  } catch {
    throwError(state, `tag name is malformed: ${rawTag}`)
  }
}

function findExplicitTag<T extends ScalarTagDefinition | SequenceTagDefinition | MappingTagDefinition> (
  state: ConstructorState,
  exact: Record<string, T>,
  prefix: readonly T[],
  tagName: string,
  nodeKind: T['nodeKind']
) {
  const exactTag = exact[tagName]
  if (exactTag) return exactTag

  for (const tag of prefix) {
    if (tagName.startsWith(tag.tagName)) return tag
  }

  throwError(state, `unknown ${nodeKind} tag !<${tagName}>`)
}

function constructScalar (
  state: ConstructorState,
  event: ScalarEvent
) {
  const source = getScalarValue(state.parserState, event)
  const rawTag = event.tagStart === NO_RANGE
    ? ''
    : state.parserState.input.slice(event.tagStart, event.tagEnd)

  if (rawTag !== '') {
    if (rawTag === '!') return source

    const tagName = resolveTagName(state, rawTag)
    const tag = findExplicitTag(state, state.schema.exact.scalar, state.schema.prefix.scalar, tagName, 'scalar')
    const result = tag.resolve(source, tagName)

    if (result === NOT_RESOLVED) {
      throwError(state, `cannot resolve scalar with tag !<${tagName}>`)
    }

    return result
  }

  if (event.style === SCALAR_STYLE_PLAIN) {
    for (const tag of state.schema.implicitScalarTags) {
      const result = tag.resolve(source, tag.tagName)
      if (result !== NOT_RESOLVED) return result
    }
  }

  const strTag = state.schema.exact.scalar['tag:yaml.org,2002:str']
  if (!strTag) throwError(state, 'schema does not define the default scalar tag')

  return strTag.resolve(source, strTag.tagName)
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

function mappingKey (state: ConstructorState, key: unknown) {
  let result = key

  if (Array.isArray(result)) {
    const array = Array.prototype.slice.call(result) as unknown[]

    for (let index = 0; index < array.length; index++) {
      if (Array.isArray(array[index])) {
        throwError(state, 'nested arrays are not supported inside keys')
      }

      if (typeof array[index] === 'object' &&
          Object.prototype.toString.call(array[index]) === '[object Object]') {
        array[index] = '[object Object]'
      }
    }

    result = array
  }

  if (typeof result === 'object' &&
      Object.prototype.toString.call(result) === '[object Object]') {
    result = '[object Object]'
  }

  return String(result)
}

function isPlainObject (value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false

  const prototype = Object.getPrototypeOf(value)
  return prototype === null || prototype === Object.prototype
}

function addMappingPair (state: ConstructorState, frame: MappingFrame, key: unknown, value: unknown) {
  state.position = frame.keyPosition

  if (key === MERGE_KEY) {
    const sources = Array.isArray(value) ? value : [value]

    if (sources.length > state.maxMergeSeqLength) {
      throwError(state, `merge sequence length exceeded maxMergeSeqLength (${state.maxMergeSeqLength})`)
    }

    const seen = new Set<unknown>()

    for (const source of sources) {
      if (seen.has(source)) continue
      seen.add(source)

      if (!isPlainObject(source)) {
        throwError(state, 'cannot merge mappings; the provided source object is unacceptable')
      }

      for (const sourceKey of Object.keys(source)) {
        if (frame.keys.has(sourceKey)) continue

        callTag(state, () => frame.tag.addPair(frame.value, sourceKey, source[sourceKey]))
        frame.keys.add(sourceKey)
        frame.overridableKeys.add(sourceKey)
      }
    }

    return
  }

  const normalizedKey = mappingKey(state, key)

  if (!state.json &&
      frame.keys.has(normalizedKey) &&
      !frame.overridableKeys.has(normalizedKey)) {
    throwError(state, 'duplicated mapping key')
  }

  callTag(state, () => frame.tag.addPair(frame.value, normalizedKey, value))
  frame.keys.add(normalizedKey)
  frame.overridableKeys.delete(normalizedKey)
}

function addValue (state: ConstructorState, value: unknown) {
  const frame = state.frames[state.frames.length - 1]

  if (!frame) throwError(state, 'node appears outside a document')

  if (frame.kind === 'document') {
    if (frame.hasValue) throwError(state, 'document contains more than one root node')
    frame.value = value
    frame.hasValue = true
  } else if (frame.kind === 'sequence') {
    frame.tag.addItem(frame.value, value, frame.index++)
  } else if (frame.hasKey) {
    addMappingPair(state, frame, frame.key, value)
    frame.key = undefined
    frame.hasKey = false
  } else {
    frame.key = value
    frame.keyPosition = state.position
    frame.hasKey = true
  }
}

function storeAnchor (state: ConstructorState, event: ScalarEvent | SequenceEvent | MappingEvent, value: unknown) {
  if (event.anchorStart !== NO_RANGE) {
    state.anchors.set(state.parserState.input.slice(event.anchorStart, event.anchorEnd), value)
  }
}

function constructEvents (state: ConstructorState) {
  while (state.eventIndex < state.parserState.events.length) {
    const event = state.parserState.events[state.eventIndex++]
    state.position = eventPosition(event)

    switch (event.type) {
      case EVENT_DOCUMENT:
        state.anchors = new Map()
        state.tagDirectives = event.tagDirectives
        state.frames.push({ kind: 'document', position: state.position, value: undefined, hasValue: false })
        break

      case EVENT_SCALAR: {
        const value = constructScalar(state, event)
        storeAnchor(state, event, value)
        addValue(state, value)
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
        storeAnchor(state, event, value)
        state.frames.push({ kind: 'sequence', position: state.position, value, tag: definition.tag, index: 0 })
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
        storeAnchor(state, event, value)
        state.frames.push({
          kind: 'mapping',
          position: state.position,
          value,
          tag: definition.tag,
          key: undefined,
          keyPosition: state.position,
          hasKey: false,
          keys: new Set(),
          overridableKeys: new Set()
        })
        break
      }

      case EVENT_ALIAS: {
        const name = event.anchorStart === NO_RANGE
          ? ''
          : state.parserState.input.slice(event.anchorStart, event.anchorEnd)
        if (!state.anchors.has(name)) {
          throwError(state, `unidentified alias "${name}"`)
        }
        addValue(state, state.anchors.get(name))
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
          addValue(state, frame.value)
        }
        break
      }
    }
  }

  if (state.frames.length !== 0) throwError(state, 'unexpected end of event stream')
}

function constructDocuments (parserState: ParserState, options: ConstructOptions = {}) {
  const state = createConstructorState(parserState, options)
  constructEvents(state)
  return state.documents
}

export {
  createConstructorState,
  constructEvents,
  constructDocuments,
  type ConstructOptions,
  type ConstructorState
}
