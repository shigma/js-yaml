import { it } from 'node:test'

import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load, YAMLException } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

it('Wrong error message when yaml file contains tabs', function () {
  assert.doesNotThrow(
    function () { load(readFileSync(path.join(__dirname, '0064.yml'), 'utf8')) },
    YAMLException)
})
