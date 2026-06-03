import { createType, NODE_KIND_SCALAR } from '../type.ts'

export default createType('tag:yaml.org,2002:str', {
  nodeKind: NODE_KIND_SCALAR,
  construct: (data) => { return data !== null ? data : '' }
})
