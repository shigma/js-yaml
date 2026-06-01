import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('should properly dump negative ints in different styles', () => {
  let dumped
  const src = { integer: -100 }

  dumped = dump(src, { styles: { '!!int': 'binary' } })
  assert.deepStrictEqual(load(dumped), src)

  dumped = dump(src, { styles: { '!!int': 'octal' } })
  assert.deepStrictEqual(load(dumped), src)

  dumped = dump(src, { styles: { '!!int': 'hex' } })
  assert.deepStrictEqual(load(dumped), src)
})
