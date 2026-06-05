import { defineScalarTag } from '../../tag.ts'

const strTag = defineScalarTag('tag:yaml.org,2002:str', {
  resolve: (source) => source
})

export { strTag }
