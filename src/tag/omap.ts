import { defineTag, NODE_KIND_SEQUENCE } from '../tag.ts'

const _hasOwnProperty = Object.prototype.hasOwnProperty
const _toString = Object.prototype.toString

function resolveYamlOmap (data: any) {
  if (data === null) return true

  const objectKeys = []
  const object = data

  for (let index = 0, length = object.length; index < length; index += 1) {
    const pair = object[index]
    let pairHasKey = false

    if (_toString.call(pair) !== '[object Object]') return false

    let pairKey
    for (pairKey in pair) {
      if (_hasOwnProperty.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true
        else return false
      }
    }

    if (!pairHasKey) return false

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey)
    else return false
  }

  return true
}

function constructYamlOmap (data: any) {
  return data !== null ? data : []
}

const omapTag = defineTag('tag:yaml.org,2002:omap', {
  nodeKind: NODE_KIND_SEQUENCE,
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
})

export { omapTag }
