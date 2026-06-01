import { it } from 'node:test'

import assert from 'node:assert'
import { load } from 'js-yaml'

it('Empty block scalars loaded wrong', () => {
  assert.deepStrictEqual(load('a: |\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(load('a: |+\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(load('a: |-\nb: .'), { a: '', b: '.' })

  assert.deepStrictEqual(load('a: >\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(load('a: >+\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(load('a: >-\nb: .'), { a: '', b: '.' })

  assert.deepStrictEqual(load('a: |\n\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(load('a: |+\n\nb: .'), { a: '\n', b: '.' })
  assert.deepStrictEqual(load('a: |-\n\nb: .'), { a: '', b: '.' })

  assert.deepStrictEqual(load('a: >\n\nb: .'), { a: '', b: '.' })
  assert.deepStrictEqual(load('a: >+\n\nb: .'), { a: '\n', b: '.' })
  assert.deepStrictEqual(load('a: >-\n\nb: .'), { a: '', b: '.' })
})
