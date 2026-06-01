import { it } from 'node:test'

import assert from 'node:assert'

import { isNegativeZero } from '../../../src/common.ts'

it('isNegativeZero', function () {
  assert(!isNegativeZero(0))
  assert(!isNegativeZero(0.0))
  assert(isNegativeZero(-0))
  assert(isNegativeZero(-0.0))
})
