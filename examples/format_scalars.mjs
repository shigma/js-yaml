import assert from 'node:assert/strict'
import {
  CORE_SCHEMA,
  boolCoreTag,
  dump,
  intCoreTag,
  nullCoreTag
} from 'js-yaml'

const schema = CORE_SCHEMA.withTags(
  // Instead of defining a new tag, we override a single method of clone
  // in one line. That's compact and simple.
  { ...boolCoreTag, represent: value => value ? 'TRUE' : 'FALSE' },
  { ...intCoreTag, represent: value => value >= 0 ? `0x${value.toString(16)}` : `-0x${(-value).toString(16)}` },
  { ...nullCoreTag, represent: () => '' }
)

const actual = dump({
  enabled: true,
  archived: false,
  mask: 255,
  parent: null
}, { schema })

const expected = `enabled: TRUE
archived: FALSE
mask: 0xff
parent:
`

assert.strictEqual(actual, expected)
