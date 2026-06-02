type TypeKind = 'scalar' | 'sequence' | 'mapping'

type RepresentFn = (data: any, style?: string) => any

interface TypeOptions {
  kind: TypeKind
  multi?: boolean
  resolve?: (data: any, tag?: string) => boolean
  construct?: (data: any, type?: string) => any
  instanceOf?: object | null
  predicate?: ((data: object) => boolean) | null
  represent?: RepresentFn | { [style: string]: RepresentFn } | null
  representName?: ((data: object) => any) | null
  defaultStyle?: string | null
  styleAliases?: { [style: string]: any[] } | null
}

const DEFAULT_TYPE_OPTIONS: Required<Omit<TypeOptions, 'kind'>> = {
  multi: false,
  resolve: () => true,
  construct: (data: any) => data,
  instanceOf: null,
  predicate: null,
  represent: null,
  representName: null,
  defaultStyle: null,
  styleAliases: null
}

function compileStyleAliases (map: { [style: string]: any[] } | null) {
  const result: { [alias: string]: string } = {}

  if (map !== null) {
    Object.keys(map).forEach((style) => {
      map[style].forEach((alias) => {
        result[String(alias)] = style
      })
    })
  }

  return result
}

class Type {
  options: TypeOptions
  tag: string
  kind: TypeKind
  resolve: (data: any, tag?: string) => boolean
  construct: (data: any, type?: string) => any
  instanceOf: object | null
  predicate: ((data: object) => boolean) | null
  represent: RepresentFn | { [style: string]: RepresentFn } | null
  representName: ((data: object) => any) | null
  defaultStyle: string | null
  multi: boolean
  styleAliases: { [alias: string]: string }

  constructor (tag: string, options: TypeOptions) {
    const opts = { ...DEFAULT_TYPE_OPTIONS, ...options }

    // TODO: Add tag format check.
    this.options = options // keep original options in case user wants to extend this type later
    this.tag = tag
    this.kind = opts.kind
    this.resolve = opts.resolve
    this.construct = opts.construct
    this.instanceOf = opts.instanceOf
    this.predicate = opts.predicate
    this.represent = opts.represent
    this.representName = opts.representName
    this.defaultStyle = opts.defaultStyle
    this.multi = opts.multi
    this.styleAliases = compileStyleAliases(opts.styleAliases)
  }
}

export default Type
export type { TypeKind, TypeOptions }
