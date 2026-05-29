'use strict'

const Type = require('../type')

const _toString = Object.prototype.toString

function resolveYamlPairs (data) {
  if (data === null) return true

  let index
  let length
  let pair
  let keys
  const object = data

  const result = new Array(object.length)

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index]

    if (_toString.call(pair) !== '[object Object]') return false

    keys = Object.keys(pair)

    if (keys.length !== 1) return false

    result[index] = [keys[0], pair[keys[0]]]
  }

  return true
}

function constructYamlPairs (data) {
  if (data === null) return []

  let index
  let length
  let pair
  let keys
  const object = data
  const result = new Array(object.length)

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index]

    keys = Object.keys(pair)

    result[index] = [keys[0], pair[keys[0]]]
  }

  return result
}

module.exports = new Type('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
})
