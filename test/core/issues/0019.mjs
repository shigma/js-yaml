import { it } from 'node:test'

import assert from 'node:assert'
import { load, YAML11_SCHEMA } from 'js-yaml'

it('Timestamp parsing is one month off', () => {
  const data = load(`
---
xmas: 2011-12-24
...
`, { schema: YAML11_SCHEMA })

  // JS month starts with 0 (0 => Jan, 1 => Feb, ...)
  assert.strictEqual(data.xmas.getTime(), Date.UTC(2011, 11, 24))
})
