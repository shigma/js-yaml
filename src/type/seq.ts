import Type from '../type.ts'

export default new Type('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: (data) => { return data !== null ? data : [] }
})
