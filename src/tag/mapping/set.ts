import { defineMappingTag } from '../../tag.ts'
import { legacyMapTag, type StringMapping } from './legacy_map.ts'

const setTag = defineMappingTag('tag:yaml.org,2002:set', {
  create: (): StringMapping => ({}),
  addPair: (container, key, value) => {
    if (value !== null) return 'cannot resolve a set item'
    return legacyMapTag.addPair(container, key, value)
  },
  has: legacyMapTag.has,
  keys: legacyMapTag.keys,
  get: legacyMapTag.get
})

export { setTag }
