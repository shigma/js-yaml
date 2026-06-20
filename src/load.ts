import { YAMLException } from './common/exception.ts'
import { pick } from './common/object.ts'
import {
  constructFromEvents,
  DEFAULT_CONSTRUCTOR_OPTIONS,
  type ConstructorOptions
} from './parser/constructor.ts'
import {
  parseEvents,
  DEFAULT_PARSER_OPTIONS,
  type ParserOptions
} from './parser/parser.ts'

// `source` is supplied by `loadDocuments` itself, not by the public caller.
interface LoadOptions extends ParserOptions, Omit<ConstructorOptions, 'source'> {}

type LoadAllIterator = (document: unknown) => void

const DEFAULT_LOAD_OPTIONS: Required<LoadOptions> = {
  ...DEFAULT_PARSER_OPTIONS,
  ...DEFAULT_CONSTRUCTOR_OPTIONS
}

function loadDocuments (input: string, options: LoadOptions = {}) {
  const opts = { ...DEFAULT_LOAD_OPTIONS, ...options }
  const source = String(input)

  const PARSER_OPT_KEYS = Object.keys(DEFAULT_PARSER_OPTIONS) as
    (keyof typeof DEFAULT_PARSER_OPTIONS)[]
  const CONSTRUCTOR_OPT_KEYS = Object.keys(DEFAULT_CONSTRUCTOR_OPTIONS) as
    (keyof typeof DEFAULT_CONSTRUCTOR_OPTIONS)[]

  const events = parseEvents(source, pick(opts, PARSER_OPT_KEYS))
  return constructFromEvents(events, { ...pick(opts, CONSTRUCTOR_OPT_KEYS), source })
}

// Signatures with iterator are deprecated. Will be removed in the next versions.
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

  if (documents.length === 0) throw new YAMLException('expected a document, but the input is empty')
  if (documents.length === 1) return documents[0]

  throw new YAMLException('expected a single document in the stream, but found more')
}

export {
  load,
  loadAll,
  type LoadOptions
}
