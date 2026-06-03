import { defineTag, NODE_KIND_MAPPING } from '../tag.ts'

const mapTag = defineTag('tag:yaml.org,2002:map', {
  nodeKind: NODE_KIND_MAPPING,
  construct: (data) => { return data !== null ? data : {} }
})

export { mapTag }
