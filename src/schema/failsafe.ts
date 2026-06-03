// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346

import { Schema } from '../schema.ts'
import { strTag } from '../tag/str.ts'
import { seqTag } from '../tag/seq.ts'
import { mapTag } from '../tag/map.ts'

export default new Schema({
  explicit: [
    strTag,
    seqTag,
    mapTag
  ]
})
