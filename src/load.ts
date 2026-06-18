import { YAMLException } from './exception.ts'
import {
  constructFromEvents,
  createConstructorState,
  DEFAULT_CONSTRUCTOR_OPTIONS,
  type ConstructorOptions
} from './parser/constructor.ts'
import {
  createParserState,
  parseEvents,
  DEFAULT_PARSER_OPTIONS,
  type ParserOptions
} from './parser/parser.ts'

interface LoadOptions extends ParserOptions, ConstructorOptions {}

type LoadAllIterator = (document: unknown) => void

const DEFAULT_LOAD_OPTIONS: Required<LoadOptions> = {
  ...DEFAULT_PARSER_OPTIONS,
  ...DEFAULT_CONSTRUCTOR_OPTIONS
}

function loadDocuments (input: string, options: LoadOptions = {}) {
  const opts = { ...DEFAULT_LOAD_OPTIONS, ...options }
  const parserState = createParserState(String(input), opts)

  parseEvents(parserState)

  const constructorState = createConstructorState(parserState, opts)
  constructFromEvents(constructorState)

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
