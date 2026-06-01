import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('should dump null in different styles', () => {
  let dumped
  const src = { foo: null, bar: 1 }

  const tests = {
    lowercase: 'null',
    uppercase: 'NULL',
    camelcase: 'Null',
    canonical: '~',
    empty: ''
  }

  for (const [name, value] of Object.entries(tests)) {
    dumped = dump(src, { styles: { '!!null': name } })
    assert.strictEqual(dumped, `foo: ${value}\nbar: 1\n`)
    assert.deepStrictEqual(load(dumped), src)
  }
})
