import YAMLException from './exception.ts'
import {
  constructEvents,
  createConstructorState
} from './construct.ts'
import {
  createParserState,
  parseEvents
} from './parser.ts'
import { CORE_SCHEMA2, type Schema2 } from './schema2.ts'

interface LoadOptions2 {
  filename?: string
  schema?: Schema2
  json?: boolean
  maxDepth?: number
  maxMergeSeqLength?: number
}

type LoadAllIterator = (document: unknown) => void

const DEFAULT_LOAD_OPTIONS2: Required<LoadOptions2> = {
  filename: '',
  schema: CORE_SCHEMA2,
  json: false,
  maxDepth: 100,
  maxMergeSeqLength: 20
}

function loadDocuments (input: string, options: LoadOptions2 = {}) {
  const opts = { ...DEFAULT_LOAD_OPTIONS2, ...options }
  const parserState = createParserState(String(input), opts)

  parseEvents(parserState)

  const constructorState = createConstructorState(parserState, opts)
  constructEvents(constructorState)

  return constructorState.documents
}

function loadAll2 (input: string, options?: LoadOptions2): unknown[]
function loadAll2 (input: string, iterator: null, options?: LoadOptions2): unknown[]
function loadAll2 (input: string, iterator: LoadAllIterator, options?: LoadOptions2): void
function loadAll2 (
  input: string,
  iteratorOrOptions?: LoadAllIterator | LoadOptions2 | null,
  options?: LoadOptions2
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

function load2 (input: string, options?: LoadOptions2) {
  const documents = loadDocuments(input, options)

  if (documents.length === 0) return undefined
  if (documents.length === 1) return documents[0]

  throw new YAMLException('expected a single document in the stream, but found more')
}

export {
  load2,
  loadAll2,
  type LoadOptions2
}
