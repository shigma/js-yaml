import { defineScalarTag, MERGE_KEY, NOT_RESOLVED } from '../../tag2.ts'

const mergeTag = defineScalarTag('tag:yaml.org,2002:merge', {
  implicit: true,
  resolve: (source) => source === '<<' ? MERGE_KEY : NOT_RESOLVED
})

export { mergeTag }
