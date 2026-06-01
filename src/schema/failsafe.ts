// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346

import Schema from '../schema.ts'
import str from '../type/str.ts'
import seq from '../type/seq.ts'
import map from '../type/map.ts'

export default new Schema({
  explicit: [
    str,
    seq,
    map
  ]
})
