import Type from '../type.ts'

export default new Type('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: (data) => { return data !== null ? data : '' }
})
