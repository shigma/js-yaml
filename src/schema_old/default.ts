// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
//
// This schema is based on standard YAML's Core schema and includes most of
// extra types described at YAML tag repository. (http://yaml.org/type/)

import CORE_SCHEMA from './core.ts'
import { timestampTag } from '../tag_old/timestamp.ts'
import { mergeTag } from '../tag_old/merge.ts'
import { binaryTag } from '../tag_old/binary.ts'
import { omapTag } from '../tag_old/omap.ts'
import { pairsTag } from '../tag_old/pairs.ts'
import { setTag } from '../tag_old/set.ts'

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
