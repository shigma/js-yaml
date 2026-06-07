import util from 'node:util'
import { CORE_SCHEMA, defineMappingTag, defineScalarTag } from 'js-yaml'

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

const TEST_SCHEMA = CORE_SCHEMA.withTags([
  // NOTE: TagDefinition order matters!
  // Inherited classes must precede their parents because the dumper
  // doesn't inspect class inheritance and just picks first suitable
  // class from this array.
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
    identify: (object) => object instanceof Tag3,
    represent: (object) => {
      return { '=': object.x, y: object.y, z: object.z }
    }
  }),
  defineScalarTag('!tag2', {
    resolve: (source) => new Tag2({ x: parseInt(source, 10) }),
    identify: (object) => object instanceof Tag2,
    represent: (object) => {
      return String(object.x)
    }
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
    identify: (object) => object instanceof Foo,
    represent: (object) => {
      return {
        'my-parameter': object.myParameter,
        'my-another-parameter': object.myAnotherParameter
      }
    }
  })
])

export { Tag1, Tag2, Tag3, Foo, TEST_SCHEMA }
