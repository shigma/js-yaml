import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('Don\'t quote strings with : without need', function () {
  const data = {
    // no quotes needed
    'http://example.com': 'http://example.com',
    // quotes required
    'foo: bar': 'foo: bar',
    'foo:': 'foo:'
  }

  const expected = `
http://example.com: http://example.com
'foo: bar': 'foo: bar'
'foo:': 'foo:'
`.replace(/^\n/, '')

  assert.strictEqual(dump(data), expected)
  assert.deepStrictEqual(load(expected), data)
})
