import { defineMappingTag } from '../../tag2.ts'
import { addPair, type StringMapping } from './map.ts'

const setTag = defineMappingTag('tag:yaml.org,2002:set', {
  create: () => ({}),
  addPair: (container: StringMapping, key, value) => {
    if (value !== null) throw new Error('cannot resolve a set item')
    addPair(container, key, value)
  }
})

export { setTag }
