import { defineSequenceTag } from '../../tag.ts'

const seqTag = defineSequenceTag('tag:yaml.org,2002:seq', {
  create: () => [] as unknown[],
  addItem: (container, item) => {
    container.push(item)
  },
  identify: Array.isArray
})

export { seqTag }
