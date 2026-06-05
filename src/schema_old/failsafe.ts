// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346

import { Schema } from '../schema_old.ts'
import { strTag } from '../tag_old/str.ts'
import { seqTag } from '../tag_old/seq.ts'
import { mapTag } from '../tag_old/map.ts'

export default new Schema({
  explicit: [
    strTag,
    seqTag,
    mapTag
  ]
})
