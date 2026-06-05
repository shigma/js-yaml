import { describe, it } from 'node:test'

import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'js-yaml'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('Duplicated mapping key errors throw at beginning of key', () => {
  it('on top level', () => {
    const src = readFileSync(path.join(__dirname, '0243-basic.yml'), 'utf8')
    const lines = src.split('\n')

    try {
      load(src)
    } catch (e) {
      assert.strictEqual(lines[e.mark.line], 'duplicate: # 2')
      assert.strictEqual(e.mark.line, 9)
      assert.strictEqual(e.mark.column, 0)
    }
  })

  it('inside of mapping values', () => {
    const src = readFileSync(path.join(__dirname, '0243-nested.yml'), 'utf8')
    const lines = src.split('\n')

    try {
      load(src)
    } catch (e) {
      assert.strictEqual(lines[e.mark.line], '  duplicate: # 2')
      assert.strictEqual(e.mark.line, 9)
      assert.strictEqual(e.mark.column, 2)
    }
  })

  it('inside flow collection', () => {
    try {
      load('{ foo: 123, foo: 456 }')
    } catch (e) {
      assert.strictEqual(e.mark.line, 0)
      assert.strictEqual(e.mark.column, 12)
    }
  })

  it('inside a set', () => {
    try {
      load('   ? foo\n   ? foo\n   ? bar')
    } catch (e) {
      assert.strictEqual(e.mark.line, 1)
      assert.strictEqual(e.mark.column, 5)
    }
  })
})
