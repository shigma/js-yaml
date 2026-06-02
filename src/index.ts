import Type from './type.ts'
import Schema from './schema.ts'
import FAILSAFE_SCHEMA from './schema/failsafe.ts'
import JSON_SCHEMA from './schema/json.ts'
import CORE_SCHEMA from './schema/core.ts'
import DEFAULT_SCHEMA from './schema/default.ts'
import { load, loadAll } from './loader.ts'
import { dump } from './dumper.ts'
import type { LoadOptions } from './loader.ts'
import type { DumpOptions } from './dumper.ts'
import YAMLException from './exception.ts'

import binary from './type/binary.ts'
import float from './type/float.ts'
import map from './type/map.ts'
import nullType from './type/null.ts'
import pairs from './type/pairs.ts'
import set from './type/set.ts'
import timestamp from './type/timestamp.ts'
import bool from './type/bool.ts'
import int from './type/int.ts'
import merge from './type/merge.ts'
import omap from './type/omap.ts'
import seq from './type/seq.ts'
import str from './type/str.ts'

const types = {
  binary,
  float,
  map,
  null: nullType,
  pairs,
  set,
  timestamp,
  bool,
  int,
  merge,
  omap,
  seq,
  str
}

export {
  Type,
  Schema,
  FAILSAFE_SCHEMA,
  JSON_SCHEMA,
  CORE_SCHEMA,
  DEFAULT_SCHEMA,
  load,
  loadAll,
  dump,
  YAMLException,
  types,
}

export type { LoadOptions, DumpOptions }
