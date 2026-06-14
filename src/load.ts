import YAMLException from './exception.ts'
import {
  constructEvents,
  createConstructorState
} from './constructor.ts'
import {
  createParserState,
  parseEvents
} from './parser.ts'
import { CORE_SCHEMA, type Schema } from './schema.ts'

interface LoadOptions {
  filename?: string
  schema?: Schema
  json?: boolean
  maxDepth?: number
  maxMergeSeqLength?: number
}

type LoadAllIterator = (document: unknown) => void

const DEFAULT_LOAD_OPTIONS: Required<LoadOptions> = {
  filename: '',
  schema: CORE_SCHEMA,
  json: false,
  maxDepth: 100,
  maxMergeSeqLength: 20
}

function loadDocuments (input: string, options: LoadOptions = {}) {
  const opts = { ...DEFAULT_LOAD_OPTIONS, ...options }
  const parserState = createParserState(String(input), opts)

  parseEvents(parserState)

  const constructorState = createConstructorState(parserState, opts)
  constructEvents(constructorState)

  return constructorState.documents
}

function loadAll (input: string, options?: LoadOptions): unknown[]
function loadAll (input: string, iterator: null, options?: LoadOptions): unknown[]
function loadAll (input: string, iterator: LoadAllIterator, options?: LoadOptions): void
function loadAll (
  input: string,
  iteratorOrOptions?: LoadAllIterator | LoadOptions | null,
  options?: LoadOptions
) {
  let iterator: LoadAllIterator | null = null

  if (typeof iteratorOrOptions === 'function') {
    iterator = iteratorOrOptions
  } else if (iteratorOrOptions !== null && typeof iteratorOrOptions === 'object') {
    options = iteratorOrOptions
  }

  const documents = loadDocuments(input, options)

  if (iterator === null) return documents
  for (const document of documents) iterator(document)
}

function load (input: string, options?: LoadOptions) {
  const documents = loadDocuments(input, options)

  if (documents.length === 0) return undefined
  if (documents.length === 1) return documents[0]

  throw new YAMLException('expected a single document in the stream, but found more')
}

export {
  load,
  loadAll,
  type LoadOptions
}
