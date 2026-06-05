import { defineScalarTag, NOT_RESOLVED } from '../../tag2.ts'

const YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$')

const YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])' +
  '-([0-9][0-9]?)' +
  '-([0-9][0-9]?)' +
  '(?:[Tt]|[ \\t]+)' +
  '([0-9][0-9]?)' +
  ':([0-9][0-9])' +
  ':([0-9][0-9])' +
  '(?:\\.([0-9]*))?' +
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' +
  '(?::([0-9][0-9]))?))?$')

function resolveYamlTimestamp (source: string) {
  let match = YAML_DATE_REGEXP.exec(source)
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(source)
  if (match === null) return NOT_RESOLVED

  const year = +(match[1])
  const month = +(match[2]) - 1
  const day = +(match[3])

  if (!match[4]) return new Date(Date.UTC(year, month, day))

  const hour = +(match[4])
  const minute = +(match[5])
  const second = +(match[6])
  let fraction = 0

  if (match[7]) {
    let value = match[7].slice(0, 3)
    while (value.length < 3) value += '0'
    fraction = +value
  }

  const date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction))

  if (match[9]) {
    const offset = (+(match[10]) * 60 + +(match[11] || 0)) * 60000
    date.setTime(date.getTime() - (match[9] === '-' ? -offset : offset))
  }

  return date
}

const timestampTag = defineScalarTag('tag:yaml.org,2002:timestamp', {
  implicit: true,
  resolve: resolveYamlTimestamp,
  identify: (object) => object instanceof Date,
  represent: (object: Date) => object.toISOString()
})

export { timestampTag }
