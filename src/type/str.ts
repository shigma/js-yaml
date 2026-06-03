import { Type, NODE_KIND_SCALAR } from '../type.ts'

export default new Type('tag:yaml.org,2002:str', {
  nodeKind: NODE_KIND_SCALAR,
  construct: (data) => { return data !== null ? data : '' }
})
