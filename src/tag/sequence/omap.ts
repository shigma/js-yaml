import { defineSequenceTag } from '../../tag.ts'

type OmapItem = Record<string, unknown>

const omapTag = defineSequenceTag('tag:yaml.org,2002:omap', {
  create: () => [] as OmapItem[],
  addItem: (container, item) => {
    if (Object.prototype.toString.call(item) !== '[object Object]') {
      return 'cannot resolve an ordered map item'
    }

    const object = item as OmapItem
    const itemKeys = Object.keys(object)

    if (itemKeys.length !== 1) return 'cannot resolve an ordered map item'
    for (const existing of container) {
      if (Object.prototype.hasOwnProperty.call(existing, itemKeys[0])) {
        return 'cannot resolve an ordered map item'
      }
    }

    container.push(object)
    return ''
  }
})

export { omapTag }
