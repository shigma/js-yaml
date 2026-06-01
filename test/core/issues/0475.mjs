import { it } from 'node:test'

import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

it('Should not allow nested arrays in map keys (explicit syntax)', function () {
  try {
    load(readFileSync(path.join(__dirname, '0475-case1.yml'), 'utf8'))
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: nested arrays are not supported inside keys'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})

it('Should not allow nested arrays in map keys (implicit syntax)', function () {
  try {
    load(readFileSync(path.join(__dirname, '0475-case2.yml'), 'utf8'))
  } catch (err) {
    assert(err.stack.startsWith('YAMLException: nested arrays are not supported inside keys'))
    return
  }
  assert.fail(null, null, 'Expected an error to be thrown')
})
