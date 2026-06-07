import { defineMappingTag } from '../../tag.ts'
import { mapTag, type StringMapping } from './map.ts'

const setTag = defineMappingTag('tag:yaml.org,2002:set', {
  create: (): StringMapping => ({}),
  addPair: (container, key, value) => {
    if (value !== null) return 'cannot resolve a set item'
    return mapTag.addPair(container, key, value)
  },
  has: mapTag.has,
  keys: mapTag.keys,
  get: mapTag.get
})

export { setTag }
