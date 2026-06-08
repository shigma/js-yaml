import { defineScalarTag, NOT_RESOLVED } from '../../tag.ts'

const YAML_FLOAT_PATTERN = new RegExp(
  '^(?:[-+]?(?:[0-9]+)(?:\\.[0-9]*)?(?:[eE][-+]?[0-9]+)?' +
  '|\\.[0-9]+(?:[eE][-+]?[0-9]+)?' +
  '|[-+]?\\.(?:inf|Inf|INF)' +
  '|\\.(?:nan|NaN|NAN))$')

const YAML_FLOAT_SPECIAL_PATTERN = new RegExp(
  '^(?:[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$')

function parseYamlFloat (source: string) {
  let value = source.toLowerCase()
  const sign = value[0] === '-' ? -1 : 1

  if ('+-'.includes(value[0])) value = value.slice(1)

  if (value === '.inf') return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
  if (value === '.nan') return NaN

  return sign * parseFloat(value)
}

function resolveYamlFloat (source: string) {
  if (!YAML_FLOAT_PATTERN.test(source)) return NOT_RESOLVED

  const result = parseYamlFloat(source)

  if (Number.isFinite(result) || YAML_FLOAT_SPECIAL_PATTERN.test(source)) return result
  return NOT_RESOLVED
}

function representYamlFloat (object: number) {
  if (isNaN(object)) return '.nan'
  if (object === Number.POSITIVE_INFINITY) return '.inf'
  if (object === Number.NEGATIVE_INFINITY) return '-.inf'
  if (Object.is(object, -0)) return '-0.0'

  const result = object.toString(10)
  return /^[-+]?[0-9]+e/.test(result) ? result.replace('e', '.e') : result
}

const floatYaml11Tag = defineScalarTag('tag:yaml.org,2002:float', {
  implicit: true,
  // Superset of source.charAt(0) over all matched inputs: optional sign, '.', or digit
  // ('.inf'/'.nan' start with '.').
  implicitFirstChars: ['-', '+', '.', ...'0123456789'],
  resolve: resolveYamlFloat,
  identify: (object) => Object.prototype.toString.call(object) === '[object Number]' &&
    (object % 1 !== 0 || Object.is(object, -0)),
  represent: representYamlFloat
})

export { floatYaml11Tag }
