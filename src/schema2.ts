import {
  type MappingTagDefinition,
  type ScalarTagDefinition,
  type SequenceTagDefinition,
  type TagDefinition
} from './tag2.ts'
import { strTag } from './tag2/scalar/str.ts'
import { nullTag } from './tag2/scalar/null.ts'
import { boolTag } from './tag2/scalar/bool.ts'
import { intTag } from './tag2/scalar/int.ts'
import { floatTag } from './tag2/scalar/float.ts'
import { mergeTag } from './tag2/scalar/merge.ts'
import { binaryTag } from './tag2/scalar/binary.ts'
import { timestampTag } from './tag2/scalar/timestamp.ts'
import { seqTag } from './tag2/sequence/seq.ts'
import { omapTag } from './tag2/sequence/omap.ts'
import { pairsTag } from './tag2/sequence/pairs.ts'
import { mapTag } from './tag2/mapping/map.ts'
import { setTag } from './tag2/mapping/set.ts'

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

class Schema2 {
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
}

const FAILSAFE_SCHEMA2 = new Schema2([
  strTag,
  seqTag,
  mapTag
])

const JSON_SCHEMA2 = new Schema2([
  ...FAILSAFE_SCHEMA2.tags,
  nullTag,
  boolTag,
  intTag,
  floatTag
])

const CORE_SCHEMA2 = new Schema2([
  ...FAILSAFE_SCHEMA2.tags,
  nullTag,
  // TODO: change late to core tag definitions
  boolTag,
  intTag,
  floatTag
])

const YAML11_SCHEMA = new Schema2([
  ...CORE_SCHEMA2.tags,
  timestampTag,
  mergeTag,
  binaryTag,
  omapTag,
  pairsTag,
  setTag
])

export {
  Schema2,
  FAILSAFE_SCHEMA2,
  JSON_SCHEMA2,
  CORE_SCHEMA2,
  YAML11_SCHEMA,

  type TagDefinitionMap,
  type TagDefinitionListMap
}
