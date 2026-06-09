import {
  CORE_SCHEMA,
  boolCoreTag,
  dump,
  intCoreTag,
  nullCoreTag
} from 'js-yaml'

const schema = CORE_SCHEMA.withTags(
  { ...boolCoreTag, represent: value => value ? 'TRUE' : 'FALSE' },
  { ...intCoreTag, represent: value => value >= 0 ? `0x${value.toString(16)}` : `-0x${(-value).toString(16)}` },
  { ...nullCoreTag, represent: () => '' }
)

console.log(dump({
  enabled: true,
  archived: false,
  mask: 255,
  parent: null
}, { schema }))
// enabled: TRUE
// archived: FALSE
// mask: 0xff
// parent:
