import { defineScalarTag } from '../../tag2.ts'

const strTag = defineScalarTag('tag:yaml.org,2002:str', {
  resolve: (source) => source
})

export { strTag }
