import { defineScalarTag, NOT_RESOLVED } from '../../tag.ts'

const nullYaml11Tag = defineScalarTag('tag:yaml.org,2002:null', {
  implicit: true,
  // Superset of source.charAt(0) over all matched inputs: '' (empty), '~', 'null'/'Null'/'NULL'.
  implicitFirstChars: ['', '~', 'n', 'N'],
  resolve: (source) => {
    const length = source.length

    if (length === 0 ||
        (length === 1 && source === '~') ||
        (length === 4 && (source === 'null' || source === 'Null' || source === 'NULL'))) {
      return null
    }

    return NOT_RESOLVED
  },
  identify: (object) => object === null,
  represent: () => 'null'
})

export { nullYaml11Tag }
