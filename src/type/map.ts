import { createType, NODE_KIND_MAPPING } from '../type.ts'

export default createType('tag:yaml.org,2002:map', {
  nodeKind: NODE_KIND_MAPPING,
  construct: (data) => { return data !== null ? data : {} }
})
