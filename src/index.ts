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

import {
  EVENT_DOCUMENT,
  EVENT_SEQUENCE,
  EVENT_MAPPING,
  EVENT_SCALAR,
  EVENT_ALIAS,
  EVENT_POP,
  SCALAR_STYLE_PLAIN,
  SCALAR_STYLE_SINGLE_QUOTED,
  SCALAR_STYLE_DOUBLE_QUOTED,
  SCALAR_STYLE_LITERAL_BLOCK,
  SCALAR_STYLE_FOLDED_BLOCK,
  COLLECTION_STYLE_BLOCK,
  COLLECTION_STYLE_FLOW,
  CHOMPING_CLIP,
  CHOMPING_STRIP,
  CHOMPING_KEEP,
  type EventType,
  type ScalarStyle,
  type CollectionStyle,
  type Chomping,
  type DocumentEvent,
  type SequenceEvent,
  type MappingEvent,
  type ScalarEvent,
  type AliasEvent,
  type PopEvent,
  type Event
} from './events.ts'

import {
  createParserState,
  parseEvents,
  type ParserState,
  type ParserOptions
} from './parser.ts'

import { getScalarValue } from './scalar.ts'

import {
  createConstructorState,
  constructEvents,
  constructDocuments,
  type ConstructOptions,
  type ConstructorState
} from './construct.ts'

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

  EVENT_DOCUMENT,
  EVENT_SEQUENCE,
  EVENT_MAPPING,
  EVENT_SCALAR,
  EVENT_ALIAS,
  EVENT_POP,
  SCALAR_STYLE_PLAIN,
  SCALAR_STYLE_SINGLE_QUOTED,
  SCALAR_STYLE_DOUBLE_QUOTED,
  SCALAR_STYLE_LITERAL_BLOCK,
  SCALAR_STYLE_FOLDED_BLOCK,
  COLLECTION_STYLE_BLOCK,
  COLLECTION_STYLE_FLOW,
  CHOMPING_CLIP,
  CHOMPING_STRIP,
  CHOMPING_KEEP,

  createParserState,
  parseEvents,
  getScalarValue,

  createConstructorState,
  constructEvents,
  constructDocuments,

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
  type Represent,

  type EventType,
  type ScalarStyle,
  type CollectionStyle,
  type Chomping,
  type DocumentEvent,
  type SequenceEvent,
  type MappingEvent,
  type ScalarEvent,
  type AliasEvent,
  type PopEvent,
  type Event,

  type ParserState,
  type ParserOptions,

  type ConstructOptions,
  type ConstructorState
}
