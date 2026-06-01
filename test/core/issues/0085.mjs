import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

const DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
]

it('Dumper should take into account booleans syntax from YAML 1.0/1.1', function () {
  DEPRECATED_BOOLEANS_SYNTAX.forEach(function (string) {
    const dumped = dump(string).trim()

    assert(
      ((dumped === `'${string}'`) || (dumped === `"${string}"`)),
      (`"${string}" string is dumped without quoting; actual dump: ${dumped}`)
    )
  })
})
