import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('Flow style does not dump with block literals.', () => {
  assert.strictEqual(dump({ a: '\n' }, { flowLevel: 0 }), '{a: "\\n"}\n')
})

it('Ok to dump block-style literals when not yet flowing.', () => {
  // cf. example 8.6 from the YAML 1.2 spec
  assert.strictEqual(dump({ a: '\n' }, { flowLevel: 2 }), 'a: |+\n\n')
})
