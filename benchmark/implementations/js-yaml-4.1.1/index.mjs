import { createRequire } from 'node:module'

const { load } = createRequire(import.meta.url)('../../extra/node_modules/js-yaml')

export function run (data) {
  return load(data)
}
