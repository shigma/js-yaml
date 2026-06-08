// Override how a type is dumped: clone the built-in tag, swap `represent`.

import { YAML11_SCHEMA, boolTag, intTag, nullTag, dump } from 'js-yaml'

const schema = YAML11_SCHEMA.withTags(
  { ...boolTag, represent: o => o ? 'yes' : 'no' },
  { ...intTag, represent: o => o >= 0 ? `0x${o.toString(16)}` : `-0x${(-o).toString(16)}` },
  { ...nullTag, represent: () => '' }
)

console.log(dump({ enabled: true, archived: false, mask: 255, parent: null }, { schema }))
// enabled: yes
// archived: no
// mask: 0xff
// parent:
