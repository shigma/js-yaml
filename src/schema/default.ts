// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)

import CORE_SCHEMA from './core.ts'
import timestamp from '../type/timestamp.ts'
import merge from '../type/merge.ts'
import binary from '../type/binary.ts'
import omap from '../type/omap.ts'
import pairs from '../type/pairs.ts'
import set from '../type/set.ts'

export default CORE_SCHEMA.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
})
