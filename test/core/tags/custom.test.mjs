import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import util from 'node:util'
import { load, CORE_SCHEMA, defineMappingTag, defineScalarTag } from 'js-yaml'

function Tag1 (parameters) {
  this.x = parameters.x
  this.y = parameters.y || 0
  this.z = parameters.z || 0
}

function Tag2 () {
  Tag1.apply(this, arguments)
}
util.inherits(Tag2, Tag1)

function Tag3 () {
  Tag2.apply(this, arguments)
}
util.inherits(Tag3, Tag2)

function Foo (parameters) {
  this.myParameter = parameters.myParameter
  this.myAnotherParameter = parameters.myAnotherParameter
}

const schema = CORE_SCHEMA.withTags([
  defineMappingTag('!tag3', {
    create: () => new Tag3({}),
    addPair: (container, key, value) => {
      if (key === '=' || key === 'x') container.x = value
      else if (key === 'y') container.y = value
      else if (key === 'z') container.z = value
    },
    has: () => false,
    keys: (container) => Object.keys(container),
    get: (container, key) => container[key],
    identify: (object) => object instanceof Tag3
  }),

  defineScalarTag('!tag2', {
    resolve: (source) => new Tag2({ x: parseInt(source, 10) }),
    identify: (object) => object instanceof Tag2
  }),

  defineMappingTag('!tag1', {
    create: () => new Tag1({}),
    addPair: (container, key, value) => {
      if (key === 'x') container.x = value
      else if (key === 'y') container.y = value
      else if (key === 'z') container.z = value
    },
    has: () => false,
    keys: (container) => Object.keys(container),
    get: (container, key) => container[key],
    identify: (object) => object instanceof Tag1
  }),

  defineMappingTag('!foo', {
    create: () => new Foo({}),
    addPair: (container, key, value) => {
      if (key === 'my-parameter') container.myParameter = value
      else if (key === 'my-another-parameter') container.myAnotherParameter = value
    },
    has: () => false,
    keys: (container) => Object.keys(container),
    get: (container, key) => container[key],
    identify: (object) => object instanceof Foo
  })
])

describe('tags', () => {
  it('custom', () => {
    const src = `
- !tag1
  x: 1
- !tag1
  x: 1
  'y': 2
  z: 3
- !tag2
  10
- !tag3
  x: 1
- !tag3
  x: 1
  'y': 2
  z: 3
- !tag3
  =: 1
  'y': 2
  z: 3
- !foo
  my-parameter: foo
  my-another-parameter: [1,2,3]
`
    const expected = [
      new Tag1({ x: 1 }),
      new Tag1({ x: 1, y: 2, z: 3 }),
      new Tag2({ x: 10 }),
      new Tag3({ x: 1 }),
      new Tag3({ x: 1, y: 2, z: 3 }),
      new Tag3({ x: 1, y: 2, z: 3 }),
      new Foo({ myParameter: 'foo', myAnotherParameter: [1, 2, 3] })
    ]

    const actual = load(src, { schema })

    assert.equal(actual.length, expected.length)

    for (let i = 0; i < expected.length; i++) {
      assert.deepStrictEqual(actual[i], expected[i])
      assert.strictEqual(Object.getPrototypeOf(actual[i]), Object.getPrototypeOf(expected[i]))
    }
  })

  // One tag name registered for two node kinds; dispatch picks by node kind.
  it('custom tag with multiple node kinds', () => {
    const multiSchema = CORE_SCHEMA.withTags([
      defineScalarTag('!Include', {
        resolve: (obj) => obj
      }),
      defineMappingTag('!Include', {
        create: () => ({}),
        addPair: (container, key, value) => { container[String(key)] = value },
        has: (container, key) => Object.hasOwn(container, String(key)),
        keys: (container) => Object.keys(container),
        get: (container, key) => container[String(key)]
      })
    ])

    assert.deepStrictEqual(load('!Include foobar', { schema: multiSchema }), 'foobar')
    assert.deepStrictEqual(load('!Include\n  location: foobar', { schema: multiSchema }), { location: 'foobar' })
  })
})
