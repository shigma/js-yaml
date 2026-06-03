'use strict'

const util = require('util')
const yaml = require('../')

class CustomTag {
  constructor (type, data) {
    this.type = type
    this.data = data
  }
}

const tags = [
  yaml.NODE_KIND_SCALAR,
  yaml.NODE_KIND_SEQUENCE,
  yaml.NODE_KIND_MAPPING
].map((nodeKind) => {
  // first argument here is a prefix, so this type will handle anything starting with !
  return new yaml.Type('!', {
    nodeKind,
    multi: true,
    representName: (object) => {
      return object.type
    },
    represent: (object) => {
      return object.data
    },
    predicate: (object) => object instanceof CustomTag,
    construct: (data, type) => {
      return new CustomTag(type, data)
    }
  })
})

const SCHEMA = yaml.DEFAULT_SCHEMA.extend(tags)

const data = `
subject: Handling unknown types in JS-YAML
scalar: !unknown_scalar_tag foo bar
sequence: !unknown_sequence_tag [ 1, 2, 3 ]
mapping: !unknown_mapping_tag { foo: 1, bar: 2 }
`

const loaded = yaml.load(data, { schema: SCHEMA })

console.log('Parsed as:')
console.log('-'.repeat(70))
console.log(util.inspect(loaded, false, 20, true))

console.log('')
console.log('')
console.log('Dumped as:')
console.log('-'.repeat(70))
console.log(yaml.dump(loaded, { schema: SCHEMA }))
