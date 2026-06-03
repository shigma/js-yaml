// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
//
// NOTE: JS-YAML does not support schema-specific tag resolution restrictions.
// So, this schema is not such strict as defined in the YAML specification.
// It allows numbers in binary notaion, use `Null` and `NULL` as `null`, etc.

import FAILSAFE_SCHEMA from './failsafe.ts'
import { nullTag } from '../tag/null.ts'
import { boolTag } from '../tag/bool.ts'
import { intTag } from '../tag/int.ts'
import { floatTag } from '../tag/float.ts'

export default FAILSAFE_SCHEMA.extend({
  implicit: [
    nullTag,
    boolTag,
    intTag,
    floatTag
  ]
})
