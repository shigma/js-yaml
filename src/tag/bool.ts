import { defineTag, NODE_KIND_SCALAR } from '../tag.ts'

function resolveYamlBoolean (data: any) {
  if (data === null) return false

  const max = data.length

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'))
}

function constructYamlBoolean (data: any) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE'
}

function isBoolean (object: any) {
  return Object.prototype.toString.call(object) === '[object Boolean]'
}

const boolTag = defineTag('tag:yaml.org,2002:bool', {
  nodeKind: NODE_KIND_SCALAR,
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: (object) => { return object ? 'true' : 'false' },
    uppercase: (object) => { return object ? 'TRUE' : 'FALSE' },
    camelcase: (object) => { return object ? 'True' : 'False' }
  },
  defaultStyle: 'lowercase'
})

export { boolTag }
