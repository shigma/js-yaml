import { defineTag, NODE_KIND_MAPPING } from '../tag_old.ts'

const _hasOwnProperty = Object.prototype.hasOwnProperty

function resolveYamlSet (data: any) {
  if (data === null) return true

  const object = data

  for (const key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false
    }
  }

  return true
}

function constructYamlSet (data: any) {
  return data !== null ? data : {}
}

const setTag = defineTag('tag:yaml.org,2002:set', {
  nodeKind: NODE_KIND_MAPPING,
  resolve: resolveYamlSet,
  construct: constructYamlSet
})

export { setTag }
