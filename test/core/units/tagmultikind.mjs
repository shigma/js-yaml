import { it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, load, Type } from 'js-yaml'

const tags = [{
  tag: 'Include',
  type: 'scalar'
}, {
  tag: 'Include',
  type: 'mapping'
}].map((fn) => {
  return new Type(`!${fn.tag}`, {
    kind: fn.type,
    resolve: () => {
      return true
    },
    construct: (obj) => {
      return obj
    }
  })
})

const schema = DEFAULT_SCHEMA.extend(tags)

it('Process tag with kind: scalar', () => {
  assert.deepStrictEqual(load('!Include foobar', {
    schema: schema
  }), 'foobar')
})

it('Process tag with kind: mapping', () => {
  assert.deepStrictEqual(load('!Include\n  location: foobar', {
    schema: schema
  }), { location: 'foobar' })
})
