import { defineSequenceTag } from '../../tag2.ts'

type Pair = [string, unknown]

const pairsTag = defineSequenceTag('tag:yaml.org,2002:pairs', {
  create: () => [] as unknown[],
  addItem: (container, item) => {
    container.push(item)
  },
  finish: (container) => {
    for (let index = 0; index < container.length; index++) {
      const item = container[index]

      if (Object.prototype.toString.call(item) !== '[object Object]') {
        throw new Error('cannot resolve a pairs item')
      }

      const object = item as Record<string, unknown>
      const keys = Object.keys(object)

      if (keys.length !== 1) throw new Error('cannot resolve a pairs item')

      container[index] = [keys[0], object[keys[0]]] satisfies Pair
    }
  }
})

export { pairsTag }
