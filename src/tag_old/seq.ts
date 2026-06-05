import { defineTag, NODE_KIND_SEQUENCE } from '../tag_old.ts'

const seqTag = defineTag('tag:yaml.org,2002:seq', {
  nodeKind: NODE_KIND_SEQUENCE,
  construct: (data) => { return data !== null ? data : [] }
})

export { seqTag }
