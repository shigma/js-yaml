import { Type, NODE_KIND_SCALAR } from '../type.ts'

function resolveYamlMerge (data: any) {
  return data === '<<' || data === null
}

export default new Type('tag:yaml.org,2002:merge', {
  nodeKind: NODE_KIND_SCALAR,
  resolve: resolveYamlMerge
})
