import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Don\'t throw on warning', () => {
  const src = `
foo: {
    bar: true
}
`
  const warnings = []

  const data = load(src)

  assert.deepStrictEqual(data, { foo: { bar: true } })

  load(src, { onWarning: (e) => { warnings.push(e) } })

  assert.strictEqual(warnings.length, 1)
})
