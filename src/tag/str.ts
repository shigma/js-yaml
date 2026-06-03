import { defineTag, NODE_KIND_SCALAR } from '../tag.ts'

const strTag = defineTag('tag:yaml.org,2002:str', {
  nodeKind: NODE_KIND_SCALAR,
  construct: (data) => { return data !== null ? data : '' }
})

export { strTag }
