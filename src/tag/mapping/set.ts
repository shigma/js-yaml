import { defineMappingTag } from '../../tag.ts'
import { addPair, type StringMapping } from './map.ts'

const setTag = defineMappingTag('tag:yaml.org,2002:set', {
  create: () => Object.create(null) as StringMapping,
  addPair: (container: StringMapping, key, value) => {
    if (value !== null) throw new Error('cannot resolve a set item')
    addPair(container, key, value)
  }
})

export { setTag }
