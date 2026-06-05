import { defineSequenceTag } from '../../tag.ts'

type OmapItem = Record<string, unknown>

const omapTag = defineSequenceTag('tag:yaml.org,2002:omap', {
  create: () => [] as OmapItem[],
  addItem: (container, item) => {
    container.push(item as OmapItem)
  },
  finish: (container) => {
    const keys = new Set<string>()

    for (const item of container) {
      if (Object.prototype.toString.call(item) !== '[object Object]') {
        throw new Error('cannot resolve an ordered map item')
      }

      const itemKeys = Object.keys(item)

      if (itemKeys.length !== 1 || keys.has(itemKeys[0])) {
        throw new Error('cannot resolve an ordered map item')
      }

      keys.add(itemKeys[0])
    }
  }
})

export { omapTag }
