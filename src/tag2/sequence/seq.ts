import { defineSequenceTag } from '../../tag2.ts'

const seqTag = defineSequenceTag('tag:yaml.org,2002:seq', {
  create: () => [] as unknown[],
  addItem: (container, item) => {
    container.push(item)
  }
})

export { seqTag }
