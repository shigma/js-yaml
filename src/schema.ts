import {
  type MappingTagDefinition,
  type ScalarTagDefinition,
  type SequenceTagDefinition,
  type TagDefinition
} from './tag.ts'
import { strTag } from './tag/scalar/str.ts'
import { nullTag } from './tag/scalar/null.ts'
import { boolTag } from './tag/scalar/bool.ts'
import { intTag } from './tag/scalar/int.ts'
import { floatTag } from './tag/scalar/float.ts'
import { mergeTag } from './tag/scalar/merge.ts'
import { binaryTag } from './tag/scalar/binary.ts'
import { timestampTag } from './tag/scalar/timestamp.ts'
import { seqTag } from './tag/sequence/seq.ts'
import { omapTag } from './tag/sequence/omap.ts'
import { pairsTag } from './tag/sequence/pairs.ts'
import { mapTag } from './tag/mapping/map.ts'
import { setTag } from './tag/mapping/set.ts'

interface TagDefinitionMap {
  scalar: Record<string, ScalarTagDefinition>
  sequence: Record<string, SequenceTagDefinition>
  mapping: Record<string, MappingTagDefinition>
}

interface TagDefinitionListMap {
  scalar: ScalarTagDefinition[]
  sequence: SequenceTagDefinition[]
  mapping: MappingTagDefinition[]
}

function createTagDefinitionMap (): TagDefinitionMap {
  return {
    scalar: {},
    sequence: {},
    mapping: {}
  }
}

function createTagDefinitionListMap (): TagDefinitionListMap {
  return {
    scalar: [],
    sequence: [],
    mapping: []
  }
}

function compileTags (tags: readonly TagDefinition[]) {
  const result: TagDefinition[] = []

  for (const tag of tags) {
    let index = result.length

    for (let previousIndex = 0; previousIndex < result.length; previousIndex++) {
      const previous = result[previousIndex]

      if (previous.nodeKind === tag.nodeKind &&
          previous.tagName === tag.tagName &&
          previous.matchByTagPrefix === tag.matchByTagPrefix) {
        index = previousIndex
        break
      }
    }

    result[index] = tag
  }

  return result
}

class Schema {
  readonly tags: readonly TagDefinition[]
  readonly implicitScalarTags: readonly ScalarTagDefinition[]
  readonly exact: TagDefinitionMap
  readonly prefix: TagDefinitionListMap

  constructor (tags: readonly TagDefinition[]) {
    const compiledTags = compileTags(tags)
    const implicitScalarTags: ScalarTagDefinition[] = []
    const exact = createTagDefinitionMap()
    const prefix = createTagDefinitionListMap()

    for (const tag of compiledTags) {
      if (tag.nodeKind === 'scalar' && tag.implicit) {
        if (tag.matchByTagPrefix) {
          throw new Error('Implicit scalar tags cannot match by tag prefix')
        }

        implicitScalarTags.push(tag)
      }

      switch (tag.nodeKind) {
        case 'scalar':
          if (tag.matchByTagPrefix) prefix.scalar.push(tag)
          else exact.scalar[tag.tagName] = tag
          break
        case 'sequence':
          if (tag.matchByTagPrefix) prefix.sequence.push(tag)
          else exact.sequence[tag.tagName] = tag
          break
        case 'mapping':
          if (tag.matchByTagPrefix) prefix.mapping.push(tag)
          else exact.mapping[tag.tagName] = tag
          break
      }
    }

    this.tags = compiledTags
    this.implicitScalarTags = implicitScalarTags
    this.exact = exact
    this.prefix = prefix
  }

  withTags (...tags: Array<TagDefinition | readonly TagDefinition[]>): Schema {
    return new Schema([
      ...this.tags,
      ...tags.flat()
    ])
  }
}

const FAILSAFE_SCHEMA = new Schema([
  strTag,
  seqTag,
  mapTag
])

const JSON_SCHEMA = new Schema([
  ...FAILSAFE_SCHEMA.tags,
  nullTag,
  boolTag,
  intTag,
  floatTag
])

const CORE_SCHEMA = new Schema([
  ...FAILSAFE_SCHEMA.tags,
  nullTag,
  // TODO: change late to core tag definitions
  boolTag,
  intTag,
  floatTag
])

const YAML11_SCHEMA = new Schema([
  ...CORE_SCHEMA.tags,
  timestampTag,
  mergeTag,
  binaryTag,
  omapTag,
  pairsTag,
  setTag
])

export {
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  YAML11_SCHEMA,

  type TagDefinitionMap,
  type TagDefinitionListMap
}
