import { it } from 'node:test'

import assert from 'node:assert'
import { dump } from 'js-yaml'

it('Should not encode astral characters', function () {
  assert.strictEqual(dump('😃😊'), '😃😊\n')
})
