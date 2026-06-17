import { defineSequenceTag } from '../../tag.ts'

type Pair = [string, unknown]

const pairsTag = defineSequenceTag('tag:yaml.org,2002:pairs', {
  create: () => [] as Pair[],
  addItem: (container, item) => {
    if (Object.prototype.toString.call(item) !== '[object Object]') {
      return 'cannot resolve a pairs item'
    }

    const object = item as Record<string, unknown>
    const keys = Object.keys(object)

    if (keys.length !== 1) return 'cannot resolve a pairs item'

    container.push([keys[0], object[keys[0]]] satisfies Pair)
    return ''
  }
})

export { pairsTag }
