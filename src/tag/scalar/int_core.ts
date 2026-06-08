import { defineScalarTag, NOT_RESOLVED } from '../../tag.ts'

function isHexCode (code: number) {
  return (code >= 0x30 && code <= 0x39) ||
         (code >= 0x41 && code <= 0x46) ||
         (code >= 0x61 && code <= 0x66)
}

function isOctCode (code: number) {
  return code >= 0x30 && code <= 0x37
}

function isDecCode (code: number) {
  return code >= 0x30 && code <= 0x39
}

function parseYamlInteger (source: string) {
  let value = source
  let sign = 1
  let ch = value[0]

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1
    value = value.slice(1)
    ch = value[0]
  }

  if (value === '0') return 0

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2)
    if (value[1] === 'x') return sign * parseInt(value.slice(2), 16)
    if (value[1] === 'o') return sign * parseInt(value.slice(2), 8)
  }

  return sign * parseInt(value, 10)
}

function resolveYamlInteger (source: string) {
  const max = source.length
  let index = 0
  let hasDigits = false

  if (!max) return NOT_RESOLVED

  let ch = source[index]

  if (ch === '-' || ch === '+') ch = source[++index]

  if (ch === '0') {
    if (index + 1 === max) return 0
    ch = source[++index]

    if (ch === 'b') {
      index++
      for (; index < max; index++) {
        ch = source[index]
        if (ch !== '0' && ch !== '1') return NOT_RESOLVED
        hasDigits = true
      }
      const result = parseYamlInteger(source)
      return hasDigits && Number.isFinite(result) ? result : NOT_RESOLVED
    }

    if (ch === 'x') {
      index++
      for (; index < max; index++) {
        if (!isHexCode(source.charCodeAt(index))) return NOT_RESOLVED
        hasDigits = true
      }
      const result = parseYamlInteger(source)
      return hasDigits && Number.isFinite(result) ? result : NOT_RESOLVED
    }

    if (ch === 'o') {
      index++
      for (; index < max; index++) {
        if (!isOctCode(source.charCodeAt(index))) return NOT_RESOLVED
        hasDigits = true
      }
      const result = parseYamlInteger(source)
      return hasDigits && Number.isFinite(result) ? result : NOT_RESOLVED
    }
  }

  for (; index < max; index++) {
    if (!isDecCode(source.charCodeAt(index))) return NOT_RESOLVED
    hasDigits = true
  }

  if (!hasDigits) return NOT_RESOLVED

  const result = parseYamlInteger(source)
  return Number.isFinite(result) ? result : NOT_RESOLVED
}

const intCoreTag = defineScalarTag('tag:yaml.org,2002:int', {
  implicit: true,
  // Superset of source.charAt(0) over all matched inputs: optional sign + decimal digit.
  implicitFirstChars: ['-', '+', ...'0123456789'],
  resolve: resolveYamlInteger,
  identify: (object) => Object.prototype.toString.call(object) === '[object Number]' &&
    (object % 1 === 0 && !Object.is(object, -0)),
  represent: (object: number) => object.toString(10)
})

export { intCoreTag }
