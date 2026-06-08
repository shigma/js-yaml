import { defineScalarTag, NOT_RESOLVED } from '../../tag.ts'

const boolYaml11Tag = defineScalarTag('tag:yaml.org,2002:bool', {
  implicit: true,
  // Superset of source.charAt(0) over all matched inputs: true/True/TRUE, false/False/FALSE.
  implicitFirstChars: ['t', 'T', 'f', 'F'],
  resolve: (source) => {
    const length = source.length

    if (length === 4 && (source === 'true' || source === 'True' || source === 'TRUE')) return true
    if (length === 5 && (source === 'false' || source === 'False' || source === 'FALSE')) return false

    return NOT_RESOLVED
  },
  identify: (object) => Object.prototype.toString.call(object) === '[object Boolean]',
  represent: (object) => object ? 'true' : 'false'
})

export { boolYaml11Tag }
