// Override how a type is dumped: clone the built-in tag, swap `represent`.

import { CORE_SCHEMA, boolCoreTag, intCoreTag, nullCoreTag, dump } from 'js-yaml'

const schema = CORE_SCHEMA.withTags(
  { ...boolCoreTag, represent: o => o ? 'TRUE' : 'FALSE' },
  { ...intCoreTag, represent: o => o >= 0 ? `0x${o.toString(16)}` : `-0x${(-o).toString(16)}` },
  { ...nullCoreTag, represent: () => '' }
)

console.log(dump({ enabled: true, archived: false, mask: 255, parent: null }, { schema }))
// enabled: TRUE
// archived: FALSE
// mask: 0xff
// parent:
