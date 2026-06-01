import { it } from 'node:test'

import assert from 'node:assert'

import common from '../../../lib/common.js'

const { isNegativeZero } = common

it('isNegativeZero', function () {
  assert(!isNegativeZero(0))
  assert(!isNegativeZero(0.0))
  assert(isNegativeZero(-0))
  assert(isNegativeZero(-0.0))
})
