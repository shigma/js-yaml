import { defineMappingTag } from '../../tag.ts'

type RealMapping = Map<unknown, unknown>

function isPlainObject (data: unknown): boolean {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return false
  const prototype = Object.getPrototypeOf(data)
  return prototype === null || prototype === Object.prototype
}

// A mapping represented as a real `Map`: keys keep their constructed type,
// nothing is stringified. Drop-in replacement for the default `!!map` tag
// (same tag name) — `CORE_SCHEMA.withTags(realMapTag)`.
const realMapTag = defineMappingTag('tag:yaml.org,2002:map', {
  create: () => new Map<unknown, unknown>(),
  addPair: (container: RealMapping, key, value) => {
    container.set(key, value)
    return ''
  },
  has: (container: RealMapping, key) => container.has(key),
  keys: (container: RealMapping) => container.keys(),
  get: (container: RealMapping, key) => container.get(key),
  // Dump side: handle both a real `Map` and a plain object, so this tag fully
  // replaces the default map representation when dumping too.
  identify: (data) => data instanceof Map || isPlainObject(data),
  represent: (data) => data instanceof Map ? Object.fromEntries(data) : data
})

export { realMapTag }
