import { defineMappingTag } from '../../tag.ts'

type StringMapping = Record<string, unknown>

function addPair (container: StringMapping, key: unknown, value: unknown) {
  // Object.create(null) is safe for direct write
  container[String(key)] = value
}

const mapTag = defineMappingTag('tag:yaml.org,2002:map', {
  create: () => Object.create(null) as StringMapping,
  addPair
})

export { mapTag, addPair, type StringMapping }
