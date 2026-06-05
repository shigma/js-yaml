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

function representYamlFloat (object: number, style?: string) {
  if (isNaN(object)) {
    if (style === 'uppercase') return '.NAN'
    if (style === 'camelcase') return '.NaN'
    return '.nan'
  }

  if (object === Number.POSITIVE_INFINITY) {
    if (style === 'uppercase') return '.INF'
    if (style === 'camelcase') return '.Inf'
    return '.inf'
  }

  if (object === Number.NEGATIVE_INFINITY) {
    if (style === 'uppercase') return '-.INF'
    if (style === 'camelcase') return '-.Inf'
    return '-.inf'
  }

  if (Object.is(object, -0)) return '-0.0'

  const result = object.toString(10)
  return /^[-+]?[0-9]+e/.test(result) ? result.replace('e', '.e') : result
}

const floatTag = defineScalarTag('tag:yaml.org,2002:float', {
  implicit: true,
  resolve: resolveYamlFloat,
  identify: (object) => Object.prototype.toString.call(object) === '[object Number]' &&
    (object % 1 !== 0 || Object.is(object, -0)),
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
})

export { floatTag }
