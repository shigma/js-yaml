import util from 'node:util'
import { DEFAULT_SCHEMA, NODE_KIND_MAPPING, NODE_KIND_SCALAR, Type } from 'js-yaml'

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

const TEST_SCHEMA = DEFAULT_SCHEMA.extend([
  // NOTE: Type order matters!
  // Inherited classes must precede their parents because the dumper
  // doesn't inspect class inheritance and just picks first suitable
  // class from this array.
  new Type('!tag3', {
    nodeKind: NODE_KIND_MAPPING,
    resolve: (data) => {
      if (data === null) return false
      if (!Object.prototype.hasOwnProperty.call(data, '=') &&
          !Object.prototype.hasOwnProperty.call(data, 'x')) {
        return false
      }
      if (!Object.keys(data).every((k) => { return k === '=' || k === 'x' || k === 'y' || k === 'z' })) {
        return false
      }
      return true
    },
    construct: (data) => {
      return new Tag3({ x: (data['='] || data.x), y: data.y, z: data.z })
    },
    predicate: (object) => object instanceof Tag3,
    represent: (object) => {
      return { '=': object.x, y: object.y, z: object.z }
    }
  }),
  new Type('!tag2', {
    nodeKind: NODE_KIND_SCALAR,
    construct: (data) => {
      return new Tag2({ x: (typeof data === 'number') ? data : parseInt(data, 10) })
    },
    predicate: (object) => object instanceof Tag2,
    represent: (object) => {
      return String(object.x)
    }
  }),
  new Type('!tag1', {
    nodeKind: NODE_KIND_MAPPING,
    resolve: (data) => {
      if (data === null) return false
      if (!Object.prototype.hasOwnProperty.call(data, 'x')) return false
      if (!Object.keys(data).every((k) => { return k === 'x' || k === 'y' || k === 'z' })) {
        return false
      }
      return true
    },
    construct: (data) => {
      return new Tag1({ x: data.x, y: data.y, z: data.z })
    },
    predicate: (object) => object instanceof Tag1
  }),
  new Type('!foo', {
    nodeKind: NODE_KIND_MAPPING,
    resolve: (data) => {
      if (data === null) return false
      if (!Object.keys(data).every((k) => { return k === 'my-parameter' || k === 'my-another-parameter' })) {
        return false
      }
      return true
    },
    construct: (data) => {
      return new Foo({
        myParameter: data['my-parameter'],
        myAnotherParameter: data['my-another-parameter']
      })
    },
    predicate: (object) => object instanceof Foo,
    represent: (object) => {
      return {
        'my-parameter': object.myParameter,
        'my-another-parameter': object.myAnotherParameter
      }
    }
  })
])

export { Tag1, Tag2, Tag3, Foo, TEST_SCHEMA }
