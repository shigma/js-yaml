import Type from '../type.ts'

export default new Type('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: (data) => { return data !== null ? data : {} }
})
