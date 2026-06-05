import {
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  YAML11_SCHEMA,
  type TagDefinitionMap,
  type TagDefinitionListMap
} from './schema.ts'

import {
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
} from './tag.ts'

import { strTag } from './tag/scalar/str.ts'
import { nullTag } from './tag/scalar/null.ts'
import { boolTag } from './tag/scalar/bool.ts'
import { intTag } from './tag/scalar/int.ts'
import { floatTag } from './tag/scalar/float.ts'
import { mapTag } from './tag/mapping/map.ts'
import { seqTag } from './tag/sequence/seq.ts'
import { mergeTag } from './tag/scalar/merge.ts'

import { binaryTag } from './tag/scalar/binary.ts'
import { timestampTag } from './tag/scalar/timestamp.ts'
import { omapTag } from './tag/sequence/omap.ts'
import { pairsTag } from './tag/sequence/pairs.ts'
import { setTag } from './tag/mapping/set.ts'

import { load, loadAll, type LoadOptions } from './load.ts'
import { dump, type DumpOptions } from './dumper.ts'
import YAMLException from './exception.ts'

export {
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  YAML11_SCHEMA,

  NOT_RESOLVED,
  MERGE_KEY,
  defineScalarTag,
  defineSequenceTag,
  defineMappingTag,

  strTag,
  nullTag,
  boolTag,
  intTag,
  floatTag,
  seqTag,
  mapTag,

  mergeTag,
  binaryTag,
  timestampTag,
  omapTag,
  pairsTag,
  setTag,

  load,
  loadAll,
  dump,
  YAMLException,

  type LoadOptions,
  type DumpOptions,
  type TagDefinitionMap,
  type TagDefinitionListMap,
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
