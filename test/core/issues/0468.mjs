import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('should not indent arrays an extra level when disabled', function () {
  const output = dump(
    [
      {
        a: 'a_val',
        b: 'b_val'
      },
      {
        a: 'a2_val',
        items: [
          {
            a: 'a_a_val',
            b: 'a_b_val'
          }
        ]
      }
    ],
    { noArrayIndent: true }
  )
  const expected = '- a: a_val\n  b: b_val\n- a: a2_val\n  items:\n  - a: a_a_val\n    b: a_b_val\n'
  assert.strictEqual(output, expected)
})
