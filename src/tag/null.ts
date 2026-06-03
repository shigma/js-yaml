import { defineTag, NODE_KIND_SCALAR } from '../tag.ts'

function resolveYamlNull (data: any) {
  if (data === null) return true

  const max = data.length

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'))
}

function constructYamlNull () {
  return null
}

function isNull (object: any) {
  return object === null
}

const nullTag = defineTag('tag:yaml.org,2002:null', {
  nodeKind: NODE_KIND_SCALAR,
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: () => { return '~' },
    lowercase: () => { return 'null' },
    uppercase: () => { return 'NULL' },
    camelcase: () => { return 'Null' },
    empty: () => { return '' }
  },
  defaultStyle: 'lowercase'
})

export { nullTag }
