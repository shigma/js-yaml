'use strict'

const Type = require('../type')

const _hasOwnProperty = Object.prototype.hasOwnProperty

function resolveYamlSet (data) {
  if (data === null) return true

  let key
  const object = data

  for (key in object) {
    if (_hasOwnProperty.call(object, key)) {
      if (object[key] !== null) return false
    }
  }

  return true
}

function constructYamlSet (data) {
  return data !== null ? data : {}
}

module.exports = new Type('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
})
