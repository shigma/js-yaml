import YAMLException from './exception.ts'
import {
  type NodeKindOrUnknown,
  type TagDefinition,
  NODE_KIND_UNKNOWN,
  NODE_KIND_SCALAR,
  NODE_KIND_SEQUENCE,
  NODE_KIND_MAPPING
} from './tag.ts'

type TagDefinitionLookup = { [tagName: string]: TagDefinition }

interface TagDefinitionMap {
  [NODE_KIND_UNKNOWN]: TagDefinitionLookup
  [NODE_KIND_SCALAR]: TagDefinitionLookup
  [NODE_KIND_SEQUENCE]: TagDefinitionLookup
  [NODE_KIND_MAPPING]: TagDefinitionLookup
  tagPrefixMatches: Record<NodeKindOrUnknown, TagDefinition[]>
}

type SchemaDefinitionObject =
  | { implicit: TagDefinition[], explicit?: TagDefinition[] }
  | { implicit?: TagDefinition[], explicit: TagDefinition[] }

type SchemaDefinition = TagDefinition | TagDefinition[] | SchemaDefinitionObject

function compileList (schema: { implicit: TagDefinition[], explicit: TagDefinition[] }, name: 'implicit' | 'explicit') {
  const result: TagDefinition[] = []

  schema[name].forEach((currentTagDefinition) => {
    let newIndex = result.length

    result.forEach((previousTagDefinition, previousIndex) => {
      if (previousTagDefinition.tagName === currentTagDefinition.tagName &&
          previousTagDefinition.nodeKind === currentTagDefinition.nodeKind &&
          previousTagDefinition.matchByTagPrefix === currentTagDefinition.matchByTagPrefix) {
        newIndex = previousIndex
      }
    })

    result[newIndex] = currentTagDefinition
  })

  return result
}

// Builds an index for fast tag definition lookup by node kind + tag name (plus tag prefix match lists),
// so resolving a tag during load/dump is O(1) instead of scanning the definition list.
// `explicit` is collected after `implicit`, so explicit definitions win on tag clashes.
function compileMap (implicit: TagDefinition[], explicit: TagDefinition[]) {
  const result: TagDefinitionMap = {
    [NODE_KIND_UNKNOWN]: {},
    [NODE_KIND_SCALAR]: {},
    [NODE_KIND_SEQUENCE]: {},
    [NODE_KIND_MAPPING]: {},
    tagPrefixMatches: {
      [NODE_KIND_UNKNOWN]: [],
      [NODE_KIND_SCALAR]: [],
      [NODE_KIND_SEQUENCE]: [],
      [NODE_KIND_MAPPING]: []
    }
  }
  function collectTagDefinition (tagDefinition: TagDefinition) {
    if (tagDefinition.matchByTagPrefix) {
      result.tagPrefixMatches[tagDefinition.nodeKind].push(tagDefinition)
      result.tagPrefixMatches[NODE_KIND_UNKNOWN].push(tagDefinition)
    } else {
      result[tagDefinition.nodeKind][tagDefinition.tagName] = result[NODE_KIND_UNKNOWN][tagDefinition.tagName] = tagDefinition
    }
  }

  implicit.forEach(collectTagDefinition)
  explicit.forEach(collectTagDefinition)
  return result
}

class Schema {
  implicit!: TagDefinition[]
  explicit!: TagDefinition[]
  compiledImplicit!: TagDefinition[]
  compiledExplicit!: TagDefinition[]
  compiledTagDefinitionMap!: TagDefinitionMap

  constructor (definition: SchemaDefinition) {
    return this.extend(definition)
  }

  extend (definition: SchemaDefinition): Schema {
    let implicit: TagDefinition[] = []
    let explicit: TagDefinition[] = []

    if (Array.isArray(definition)) {
      // Schema.extend([ tagDefinition1, tagDefinition2, ... ])
      explicit = explicit.concat(definition)
    } else if (Array.isArray((definition as SchemaDefinitionObject).implicit) ||
               Array.isArray((definition as SchemaDefinitionObject).explicit)) {
      // Schema.extend({ explicit: [ tagDefinition1, tagDefinition2, ... ], implicit: [ tagDefinition1, tagDefinition2, ... ] })
      const schema = definition as SchemaDefinitionObject

      if (schema.implicit) implicit = implicit.concat(schema.implicit)
      if (schema.explicit) explicit = explicit.concat(schema.explicit)
    } else {
      // Schema.extend(tagDefinition)
      explicit.push(definition as TagDefinition)
    }

    implicit.forEach((tagDefinition) => {
      if (tagDefinition.matchByTagPrefix) {
        throw new YAMLException('There is a tag prefix matching definition in the implicit list of a schema. Prefix matching tags can only be listed as explicit.')
      }
    })

    const result = Object.create(Schema.prototype)

    result.implicit = (this.implicit || []).concat(implicit)
    result.explicit = (this.explicit || []).concat(explicit)

    result.compiledImplicit = compileList(result, 'implicit')
    result.compiledExplicit = compileList(result, 'explicit')
    result.compiledTagDefinitionMap = compileMap(result.compiledImplicit, result.compiledExplicit)

    return result
  }
}

export {
  Schema,

  type TagDefinitionMap,
  type SchemaDefinition
}
