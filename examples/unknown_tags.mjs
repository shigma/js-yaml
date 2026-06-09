import util from 'node:util'
import {
  CORE_SCHEMA,
  defineMappingTag,
  defineScalarTag,
  defineSequenceTag,
  dump,
  load
} from 'js-yaml'

class TaggedValue {
  constructor (tagName, nodeKind, value) {
    this.tagName = tagName
    this.nodeKind = nodeKind
    this.value = value
  }
}

const schema = CORE_SCHEMA.withTags(
  defineScalarTag('!', {
    matchByTagPrefix: true,
    resolve: (source, tagName) => new TaggedValue(tagName, 'scalar', source),
    identify: value => value instanceof TaggedValue && value.nodeKind === 'scalar',
    representTagName: value => value.tagName,
    represent: value => value.value
  }),

  defineSequenceTag('!', {
    matchByTagPrefix: true,
    create: tagName => new TaggedValue(tagName, 'sequence', []),
    addItem: (tagged, item) => {
      tagged.value.push(item)
    },
    identify: value => value instanceof TaggedValue && value.nodeKind === 'sequence',
    representTagName: value => value.tagName,
    represent: value => value.value
  }),

  defineMappingTag('!', {
    matchByTagPrefix: true,
    create: tagName => new TaggedValue(tagName, 'mapping', new Map()),
    addPair: (tagged, key, value) => {
      tagged.value.set(key, value)
      return ''
    },
    has: (tagged, key) => tagged.value.has(key),
    keys: tagged => tagged.value.keys(),
    get: (tagged, key) => tagged.value.get(key),
    identify: value => value instanceof TaggedValue && value.nodeKind === 'mapping',
    representTagName: value => value.tagName,
    represent: value => value.value
  })
)

const source = `
scalar: !unknown_scalar_tag foo bar
sequence: !unknown_sequence_tag [1, 2, 3]
mapping: !unknown_mapping_tag { foo: 1, bar: 2 }
`

const loaded = load(source, { schema })

console.log(util.inspect(loaded, { depth: null }))
// {
//   scalar: TaggedValue {
//     tagName: '!unknown_scalar_tag',
//     nodeKind: 'scalar',
//     value: 'foo bar'
//   },
//   sequence: TaggedValue {
//     tagName: '!unknown_sequence_tag',
//     nodeKind: 'sequence',
//     value: [ 1, 2, 3 ]
//   },
//   mapping: TaggedValue {
//     tagName: '!unknown_mapping_tag',
//     nodeKind: 'mapping',
//     value: Map(2) { 'foo' => 1, 'bar' => 2 }
//   }
// }

console.log(dump(loaded, { schema, flowLevel: 1 }))
// scalar: !unknown_scalar_tag foo bar
// sequence: !unknown_sequence_tag [1, 2, 3]
// mapping: !unknown_mapping_tag {foo: 1, bar: 2}
