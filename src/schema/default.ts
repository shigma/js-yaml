// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)

import CORE_SCHEMA from './core.ts'
import { timestampTag } from '../tag/timestamp.ts'
import { mergeTag } from '../tag/merge.ts'
import { binaryTag } from '../tag/binary.ts'
import { omapTag } from '../tag/omap.ts'
import { pairsTag } from '../tag/pairs.ts'
import { setTag } from '../tag/set.ts'

export default CORE_SCHEMA.extend({
  implicit: [
    timestampTag,
    mergeTag
  ],
  explicit: [
    binaryTag,
    omapTag,
    pairsTag,
    setTag
  ]
})
