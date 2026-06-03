import { Type, NODE_KIND_SEQUENCE } from '../type.ts'

export default new Type('tag:yaml.org,2002:seq', {
  nodeKind: NODE_KIND_SEQUENCE,
  construct: (data) => { return data !== null ? data : [] }
})
