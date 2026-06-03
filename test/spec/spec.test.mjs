import { describe, it } from 'node:test'

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSONParser } from '@streamparser/json'
import { load, loadAll } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const suiteDir = path.join(__dirname, 'yaml-test-suite')
const srcDir = path.join(suiteDir, 'src')

// YAML samples contain markers to visualize whitespace and control characters.
// This function replaces them with the actual characters before parsing.
function unescapeFixtureText (text) {
  return text
    .replaceAll('␣', ' ')
    .replace(/—*»/g, '\t')
    .replaceAll('←', '\r')
    .replaceAll('⇔', '\uFEFF')
    .replaceAll('↵', '')
    .replace(/∎\n$/u, '')
}

// JSON samples contains multiple "documents" in concatenated form.
// This parser handles them right, returning array of docs.
function parseConcatenatedJSON (str) {
  const parser = new JSONParser({ separator: '' })
  const out = []

  parser.onValue = ({ value, stack }) => {
    if (stack.length === 0) out.push(value)
  }

  parser.write(str)
  parser.end()
  return out
}

describe('yaml-test-suite yaml/json fixtures', () => {
  if (!fs.existsSync(srcDir)) {
    throw new Error('Missing yaml-test-suite fixtures. Run npm run spec:get first.')
  }

  for (const file of fs.readdirSync(srcDir).sort()) {
    if (path.extname(file) !== '.yaml') continue

    const id = path.basename(file, '.yaml')
    const fixtureFile = path.join(srcDir, file)
    const fixtures = load(fs.readFileSync(fixtureFile, 'utf8'), { filename: fixtureFile })

    fixtures.forEach((fixture, index) => {
      const name = fixture.name || id
      const suffix = fixtures.length > 1 ? `/${String(index).padStart(2, '0')}` : ''

      if (fixture.fail || fixture.yaml == null || fixture.json == null) {
        it(`${id}${suffix} ${name}`, { skip: 'no yaml/json success expectation' }, () => {})
        return
      }

      it(`${id}${suffix} ${name}`, () => {
        const expectedDocs = parseConcatenatedJSON(unescapeFixtureText(fixture.json))
        const actualDocs = loadAll(unescapeFixtureText(fixture.yaml), null, { filename: `${fixtureFile}${suffix}` })

        // Unwrap single-document fixtures for better error messages.
        const expected = expectedDocs.length === 1 ? expectedDocs[0] : expectedDocs
        const actual = actualDocs.length === 1 ? actualDocs[0] : actualDocs

        assert.deepStrictEqual(actual, expected)
      })
    })
  }
})
