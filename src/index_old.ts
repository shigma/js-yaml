import {
  type NodeKind,
  type NodeKindString,
  type NodeKindOrUnknown,
  type TagDefinition,
  type PartialTagDefinition,
  defineTag,
  NODE_KIND_UNKNOWN,
  NODE_KIND_SCALAR,
  NODE_KIND_SEQUENCE,
  NODE_KIND_MAPPING,
  nodeKindToString
} from './tag_old.ts'
import { Schema } from './schema_old.ts'
import FAILSAFE_SCHEMA from './schema_old/failsafe.ts'
import JSON_SCHEMA from './schema_old/json.ts'
import CORE_SCHEMA from './schema_old/core.ts'
import DEFAULT_SCHEMA from './schema_old/default.ts'
import { load, loadAll, type LoadOptions } from './loader_old.ts'
import { dump, type DumpOptions } from './dumper.ts'
import YAMLException from './exception.ts'

import { binaryTag } from './tag_old/binary.ts'
import { floatTag } from './tag_old/float.ts'
import { mapTag } from './tag_old/map.ts'
import { nullTag } from './tag_old/null.ts'
import { pairsTag } from './tag_old/pairs.ts'
import { setTag } from './tag_old/set.ts'
import { timestampTag } from './tag_old/timestamp.ts'
import { boolTag } from './tag_old/bool.ts'
import { intTag } from './tag_old/int.ts'
import { mergeTag } from './tag_old/merge.ts'
import { omapTag } from './tag_old/omap.ts'
import { seqTag } from './tag_old/seq.ts'
import { strTag } from './tag_old/str.ts'

export {
  defineTag,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,

  binaryTag,
  boolTag,
  floatTag,
  intTag,
  mapTag,
  mergeTag,
  nullTag,
  omapTag,
  pairsTag,
  seqTag,
  setTag,
  strTag,
  timestampTag,

  NODE_KIND_UNKNOWN,
  NODE_KIND_SCALAR,
  NODE_KIND_SEQUENCE,
  NODE_KIND_MAPPING,
  nodeKindToString,

  type LoadOptions,
  type DumpOptions,
  type NodeKind,
  type NodeKindString,
  type NodeKindOrUnknown,
  type TagDefinition,
  type PartialTagDefinition
}
