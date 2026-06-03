import { defineTag, NODE_KIND_SCALAR } from '../tag.ts'

function resolveYamlMerge (data: any) {
  return data === '<<' || data === null
}

const mergeTag = defineTag('tag:yaml.org,2002:merge', {
  nodeKind: NODE_KIND_SCALAR,
  resolve: resolveYamlMerge
})

export { mergeTag }
