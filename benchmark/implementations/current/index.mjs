import yaml from '../../../index.js'

export function run (data) {
  return yaml.load(data)
}
