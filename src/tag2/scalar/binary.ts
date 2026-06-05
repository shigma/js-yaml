import { defineScalarTag, NOT_RESOLVED } from '../../tag2.ts'

const BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r'

function resolveYamlBinary (source: string) {
  let bitLength = 0

  for (let index = 0; index < source.length; index++) {
    const code = BASE64_MAP.indexOf(source.charAt(index))

    if (code > 64) continue
    if (code < 0) return NOT_RESOLVED

    bitLength += 6
  }

  if ((bitLength % 8) !== 0) return NOT_RESOLVED

  const input = source.replace(/[\r\n=]/g, '')
  let bits = 0
  const result = []

  for (let index = 0; index < input.length; index++) {
    if ((index % 4 === 0) && index) {
      result.push((bits >> 16) & 0xFF)
      result.push((bits >> 8) & 0xFF)
      result.push(bits & 0xFF)
    }

    bits = (bits << 6) | BASE64_MAP.indexOf(input.charAt(index))
  }

  const tailBits = (input.length % 4) * 6

  if (tailBits === 0) {
    result.push((bits >> 16) & 0xFF)
    result.push((bits >> 8) & 0xFF)
    result.push(bits & 0xFF)
  } else if (tailBits === 18) {
    result.push((bits >> 10) & 0xFF)
    result.push((bits >> 2) & 0xFF)
  } else if (tailBits === 12) {
    result.push((bits >> 4) & 0xFF)
  }

  return new Uint8Array(result)
}

function representYamlBinary (object: Uint8Array) {
  let result = ''
  let bits = 0

  for (let index = 0; index < object.length; index++) {
    if ((index % 3 === 0) && index) {
      result += BASE64_MAP[(bits >> 18) & 0x3F]
      result += BASE64_MAP[(bits >> 12) & 0x3F]
      result += BASE64_MAP[(bits >> 6) & 0x3F]
      result += BASE64_MAP[bits & 0x3F]
    }

    bits = (bits << 8) + object[index]
  }

  const tail = object.length % 3

  if (tail === 0) {
    result += BASE64_MAP[(bits >> 18) & 0x3F]
    result += BASE64_MAP[(bits >> 12) & 0x3F]
    result += BASE64_MAP[(bits >> 6) & 0x3F]
    result += BASE64_MAP[bits & 0x3F]
  } else if (tail === 2) {
    result += BASE64_MAP[(bits >> 10) & 0x3F]
    result += BASE64_MAP[(bits >> 4) & 0x3F]
    result += BASE64_MAP[(bits << 2) & 0x3F]
    result += BASE64_MAP[64]
  } else if (tail === 1) {
    result += BASE64_MAP[(bits >> 2) & 0x3F]
    result += BASE64_MAP[(bits << 4) & 0x3F]
    result += BASE64_MAP[64]
    result += BASE64_MAP[64]
  }

  return result
}

const binaryTag = defineScalarTag('tag:yaml.org,2002:binary', {
  resolve: resolveYamlBinary,
  identify: (object) => Object.prototype.toString.call(object) === '[object Uint8Array]',
  represent: representYamlBinary
})

export { binaryTag }
