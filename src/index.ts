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
