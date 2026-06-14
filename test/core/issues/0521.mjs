import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('Don\'t quote strings with # without need', () => {
  const required = `
http://example.com/page#anchor: no:quotes#required
parameter#fallback: 'quotes #required'
'quotes: required': Visit [link](http://example.com/foo#bar)
'foo #bar': key is quoted
`.replace(/^\n/, '')

  const sample = {
    'http://example.com/page#anchor': 'no:quotes#required',
    'parameter#fallback': 'quotes #required',
    'quotes: required': 'Visit [link](http://example.com/foo#bar)',
    'foo #bar': 'key is quoted'
  }

  assert.strictEqual(
    dump(sample),
    required
  )
})
