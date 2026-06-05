import { defineScalarTag, MERGE_KEY, NOT_RESOLVED } from '../../tag.ts'

const mergeTag = defineScalarTag('tag:yaml.org,2002:merge', {
  implicit: true,
  // `<<` is the merge key; an empty node tagged `!!merge` explicitly is a merge
  // too. The empty case is shadowed by `!!null` during implicit resolution, so it
  // only takes effect when the tag is given explicitly.
  resolve: (source) => source === '<<' || source === '' ? MERGE_KEY : NOT_RESOLVED
})

export { mergeTag }
