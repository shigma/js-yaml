import { defineMappingTag } from '../../tag2.ts'

type StringMapping = Record<string, unknown>

function addPair (container: StringMapping, key: unknown, value: unknown) {
  const property = String(key)

  if (property === '__proto__') {
    Object.defineProperty(container, property, {
      configurable: true,
      enumerable: true,
      writable: true,
      value
    })
  } else {
    container[property] = value
  }
}

const mapTag = defineMappingTag('tag:yaml.org,2002:map', {
  create: () => ({}),
  addPair
})

export { mapTag, addPair, type StringMapping }
