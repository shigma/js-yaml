import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('should properly dump leading newlines and spaces', function () {
  let src = { str: '\n  a\nb' }
  let dumped = dump(src)
  assert.deepStrictEqual(load(dumped), src)

  src = { str: '\n\n  a\nb' }
  dumped = dump(src)
  assert.deepStrictEqual(load(dumped), src)

  src = { str: '\n  a\nb' }
  dumped = dump(src, { indent: 10 })
  assert.deepStrictEqual(load(dumped), src)
})
