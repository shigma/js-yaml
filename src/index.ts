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
import { nullCoreTag } from './tag/scalar/null_core.ts'
import { nullJsonTag } from './tag/scalar/null_json.ts'
import { nullYaml11Tag } from './tag/scalar/null_yaml11.ts'
import { boolCoreTag } from './tag/scalar/bool_core.ts'
import { boolJsonTag } from './tag/scalar/bool_json.ts'
import { boolYaml11Tag } from './tag/scalar/bool_yaml11.ts'
import { intCoreTag } from './tag/scalar/int_core.ts'
import { intJsonTag } from './tag/scalar/int_json.ts'
import { intYaml11Tag } from './tag/scalar/int_yaml11.ts'
import { floatCoreTag } from './tag/scalar/float_core.ts'
import { floatJsonTag } from './tag/scalar/float_json.ts'
import { floatYaml11Tag } from './tag/scalar/float_yaml11.ts'
import { mapTag } from './tag/mapping/map.ts'
import { realMapTag } from './tag/mapping/real_map.ts'
import { seqTag } from './tag/sequence/seq.ts'
import { mergeTag } from './tag/scalar/merge.ts'

import { binaryTag } from './tag/scalar/binary.ts'
import { timestampTag } from './tag/scalar/timestamp.ts'
import { omapTag } from './tag/sequence/omap.ts'
import { pairsTag } from './tag/sequence/pairs.ts'
import { setTag } from './tag/mapping/set.ts'

import { load, loadAll, type LoadOptions } from './load.ts'
import { dump, type DumpOptions } from './dump.ts'
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
} from './parser/events.ts'

import {
  createParserState,
  parseEvents,
  type ParserState,
  type ParserOptions
} from './parser/parser.ts'

import { getScalarValue } from './parser/parser_scalar.ts'

import {
  createConstructorState,
  constructEvents,
  constructDocuments,
  type ConstructorOptions,
  type ConstructorState
} from './parser/constructor.ts'

import { eventsToAst, type FromEventsOptions } from './ast/from_events.ts'
import { present, type PresenterOptions } from './ast/presenter.ts'
import {
  Style,
  type Node,
  type Document,
  type Stream,
  type NodeBase,
  type ScalarNode,
  type SequenceNode,
  type MappingNode,
  type AliasNode
} from './ast/nodes.ts'

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
  nullCoreTag,
  nullJsonTag,
  nullYaml11Tag,
  boolCoreTag,
  boolJsonTag,
  boolYaml11Tag,
  intCoreTag,
  intJsonTag,
  intYaml11Tag,
  floatCoreTag,
  floatJsonTag,
  floatYaml11Tag,
  seqTag,
  mapTag,
  realMapTag,

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

  eventsToAst,
  present,
  Style,

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

  type ConstructorOptions,
  type ConstructorState,

  type FromEventsOptions,
  type PresenterOptions,
  type Node,
  type Document,
  type Stream,
  type NodeBase,
  type ScalarNode,
  type SequenceNode,
  type MappingNode,
  type AliasNode
}
