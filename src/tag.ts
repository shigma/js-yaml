const NOT_RESOLVED: unique symbol = Symbol('NOT_RESOLVED')
const MERGE_KEY: unique symbol = Symbol('MERGE_KEY')

type RepresentFn = (data: any) => any
type Represent = RepresentFn

interface ScalarTagDefinition<Result = unknown> {
  tagName: string
  nodeKind: 'scalar'
  implicit: boolean
  matchByTagPrefix: boolean
  // Set of `source.charAt(0)` keys for which `resolve` may succeed (a superset of
  // what it really matches). A key is either a single character or '' (empty
  // source). `null` means "no constraint, always try". Used by the composer to
  // dispatch implicit scalars by first character without running every resolver.
  implicitFirstChars: readonly string[] | null
  resolve: (source: string, tagName: string) => Result | typeof NOT_RESOLVED
  identify: ((data: any) => boolean) | null
  represent: Represent | null
  representTagName: ((data: any) => string) | null
}

interface SequenceTagDefinition<Container = unknown> {
  tagName: string
  nodeKind: 'sequence'
  implicit: false
  matchByTagPrefix: boolean
  create: (tagName: string) => Container
  addItem: (container: Container, item: unknown, index: number) => void
  finish: ((container: Container) => void) | null
  identify: ((data: any) => boolean) | null
  represent: Represent | null
  representTagName: ((data: any) => string) | null
}

interface MappingTagDefinition<Container = unknown> {
  tagName: string
  nodeKind: 'mapping'
  implicit: false
  matchByTagPrefix: boolean
  create: (tagName: string) => Container
  // Writes a pair. Returns '' on success, a non-empty error message otherwise
  // (key does not fit the representation, value rejected, ...). Always a string
  // so the hot path never allocates an exception wrapper.
  addPair: (container: Container, key: unknown, value: unknown) => string
  // Read side, mirrors `Map` — defining a representation means defining how to
  // read it back. `has` is the hot dedup probe (membership without fetching the
  // value); `keys`/`get` are used only on the cold merge path (`<<`).
  has: (container: Container, key: unknown) => boolean
  keys: (container: Container) => Iterable<unknown>
  get: (container: Container, key: unknown) => unknown
  finish: ((container: Container) => void) | null
  identify: ((data: any) => boolean) | null
  represent: Represent | null
  representTagName: ((data: any) => string) | null
}

type TagDefinition =
  | ScalarTagDefinition<any>
  | SequenceTagDefinition<any>
  | MappingTagDefinition<any>

interface ScalarTagOptions<Result> {
  implicit?: boolean
  matchByTagPrefix?: boolean
  implicitFirstChars?: readonly string[] | null
  resolve: ScalarTagDefinition<Result>['resolve']
  identify?: ScalarTagDefinition<Result>['identify']
  represent?: ScalarTagDefinition<Result>['represent']
  representTagName?: ScalarTagDefinition<Result>['representTagName']
}

interface SequenceTagOptions<Container> {
  matchByTagPrefix?: boolean
  create: SequenceTagDefinition<Container>['create']
  addItem: SequenceTagDefinition<Container>['addItem']
  finish?: SequenceTagDefinition<Container>['finish']
  identify?: SequenceTagDefinition<Container>['identify']
  represent?: SequenceTagDefinition<Container>['represent']
  representTagName?: SequenceTagDefinition<Container>['representTagName']
}

interface MappingTagOptions<Container> {
  matchByTagPrefix?: boolean
  create: MappingTagDefinition<Container>['create']
  addPair: MappingTagDefinition<Container>['addPair']
  has: MappingTagDefinition<Container>['has']
  keys: MappingTagDefinition<Container>['keys']
  get: MappingTagDefinition<Container>['get']
  finish?: MappingTagDefinition<Container>['finish']
  identify?: MappingTagDefinition<Container>['identify']
  represent?: MappingTagDefinition<Container>['represent']
  representTagName?: MappingTagDefinition<Container>['representTagName']
}

function defineScalarTag<Result> (tagName: string, options: ScalarTagOptions<Result>): ScalarTagDefinition<Result> {
  return {
    tagName,
    nodeKind: 'scalar',
    implicit: options.implicit ?? false,
    matchByTagPrefix: options.matchByTagPrefix ?? false,
    implicitFirstChars: options.implicitFirstChars ?? null,
    resolve: options.resolve,
    identify: options.identify ?? null,
    represent: options.represent ?? null,
    representTagName: options.representTagName ?? null
  }
}

function defineSequenceTag<Container> (tagName: string, options: SequenceTagOptions<Container>): SequenceTagDefinition<Container> {
  return {
    tagName,
    nodeKind: 'sequence',
    implicit: false,
    matchByTagPrefix: options.matchByTagPrefix ?? false,
    create: options.create,
    addItem: options.addItem,
    finish: options.finish ?? null,
    identify: options.identify ?? null,
    represent: options.represent ?? null,
    representTagName: options.representTagName ?? null
  }
}

function defineMappingTag<Container> (tagName: string, options: MappingTagOptions<Container>): MappingTagDefinition<Container> {
  return {
    tagName,
    nodeKind: 'mapping',
    implicit: false,
    matchByTagPrefix: options.matchByTagPrefix ?? false,
    create: options.create,
    addPair: options.addPair,
    has: options.has,
    keys: options.keys,
    get: options.get,
    finish: options.finish ?? null,
    identify: options.identify ?? null,
    represent: options.represent ?? null,
    representTagName: options.representTagName ?? null
  }
}

export {
  NOT_RESOLVED,
  MERGE_KEY,
  defineScalarTag,
  defineSequenceTag,
  defineMappingTag,

  type ScalarTagDefinition,
  type SequenceTagDefinition,
  type MappingTagDefinition,
  type TagDefinition,
  type ScalarTagOptions,
  type SequenceTagOptions,
  type MappingTagOptions,
  type RepresentFn,
  type Represent
}
