import { defineScalarTag, NOT_RESOLVED } from '../../tag2.ts'

const nullTag = defineScalarTag('tag:yaml.org,2002:null', {
  implicit: true,
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
  represent: {
    canonical: () => '~',
    lowercase: () => 'null',
    uppercase: () => 'NULL',
    camelcase: () => 'Null',
    empty: () => ''
  },
  defaultStyle: 'lowercase'
})

export { nullTag }
