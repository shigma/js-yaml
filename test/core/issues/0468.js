'use strict'

const { it } = require('node:test')

var assert = require('assert')
var yaml = require('js-yaml')

it('should not indent arrays an extra level when disabled', function () {
  var output = yaml.dump(
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
  var expected = '- a: a_val\n  b: b_val\n- a: a2_val\n  items:\n  - a: a_a_val\n    b: a_b_val\n'
  assert.strictEqual(output, expected)
})
