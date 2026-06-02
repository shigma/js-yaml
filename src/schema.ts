import YAMLException from './exception.ts'
import Type from './type.ts'

interface TypeMap {
  scalar: { [tag: string]: Type }
  sequence: { [tag: string]: Type }
  mapping: { [tag: string]: Type }
  fallback: { [tag: string]: Type }
  multi: {
    scalar: Type[]
    sequence: Type[]
    mapping: Type[]
    fallback: Type[]
  }
}

interface SchemaDefinitionObject {
  implicit?: Type[]
  explicit?: Type[]
}

type SchemaDefinition = Type | Type[] | SchemaDefinitionObject

function compileList (schema: { implicit: Type[], explicit: Type[] }, name: 'implicit' | 'explicit') {
  const result: Type[] = []

  schema[name].forEach((currentType) => {
    let newIndex = result.length

    result.forEach((previousType, previousIndex) => {
      if (previousType.tag === currentType.tag &&
          previousType.kind === currentType.kind &&
          previousType.multi === currentType.multi) {
        newIndex = previousIndex
      }
    })

    result[newIndex] = currentType
  })

  return result
}

// Builds an index for fast type lookup by kind + tag (plus multi-type lists),
// so resolving a tag during load/dump is O(1) instead of scanning the type list.
// `explicit` is collected after `implicit`, so explicit types win on tag clashes.
function compileMap (implicit: Type[], explicit: Type[]) {
  const result: TypeMap = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }
  function collectType (type: Type) {
    if (type.multi) {
      result.multi[type.kind].push(type)
      result.multi['fallback'].push(type)
    } else {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type
    }
  }

  implicit.forEach(collectType)
  explicit.forEach(collectType)
  return result
}

class Schema {
  implicit!: Type[]
  explicit!: Type[]
  compiledImplicit!: Type[]
  compiledExplicit!: Type[]
  compiledTypeMap!: TypeMap

  constructor (definition: SchemaDefinition) {
    return this.extend(definition)
  }

  extend (definition: SchemaDefinition): Schema {
    let implicit: Type[] = []
    let explicit: Type[] = []

    if (definition instanceof Type) {
      // Schema.extend(type)
      explicit.push(definition)
    } else if (Array.isArray(definition)) {
      // Schema.extend([ type1, type2, ... ])
      explicit = explicit.concat(definition)
    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
      if (definition.implicit) implicit = implicit.concat(definition.implicit)
      if (definition.explicit) explicit = explicit.concat(definition.explicit)
    } else {
      throw new YAMLException('Schema.extend argument should be a Type, [ Type ], ' +
        'or a schema definition ({ implicit: [...], explicit: [...] })')
    }

    implicit.forEach((type) => {
      if (!(type instanceof Type)) {
        throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.')
      }

      if (type.multi) {
        throw new YAMLException('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.')
      }
    })

    explicit.forEach((type) => {
      if (!(type instanceof Type)) {
        throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.')
      }
    })

    const result = Object.create(Schema.prototype)

    result.implicit = (this.implicit || []).concat(implicit)
    result.explicit = (this.explicit || []).concat(explicit)

    result.compiledImplicit = compileList(result, 'implicit')
    result.compiledExplicit = compileList(result, 'explicit')
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit)

    return result
  }
}

export default Schema
export type { TypeMap, SchemaDefinition }
