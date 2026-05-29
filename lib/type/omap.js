'use strict'

const Type = require('../type')

const _hasOwnProperty = Object.prototype.hasOwnProperty
const _toString = Object.prototype.toString

function resolveYamlOmap (data) {
  if (data === null) return true

  const objectKeys = []
  let index; let length
  let pair
  let pairKey
  let pairHasKey
  const object = data

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index]
    pairHasKey = false

    if (_toString.call(pair) !== '[object Object]') return false

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

function constructYamlOmap (data) {
  return data !== null ? data : []
}

module.exports = new Type('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
})
