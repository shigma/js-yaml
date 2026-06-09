import { describe, it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, YAML11_SCHEMA, dump, load } from 'js-yaml'

describe('Should load numbers in YAML 1.2 format', () => {
  it('should not parse base60', () => {
    // previously parsed as int
    assert.strictEqual(load('1:23', { schema: CORE_SCHEMA }), '1:23')
    // previously parsed as float
    assert.strictEqual(load('1:23.45', { schema: CORE_SCHEMA }), '1:23.45')
  })

  it('should allow leading zero in int and float', () => {
    assert.strictEqual(load('01234', { schema: CORE_SCHEMA }), 1234)
    assert.strictEqual(load('00999', { schema: CORE_SCHEMA }), 999)
    assert.strictEqual(load('-00999', { schema: CORE_SCHEMA }), -999)
    assert.strictEqual(load('001234.56', { schema: CORE_SCHEMA }), 1234.56)
    assert.strictEqual(load('001234e4', { schema: CORE_SCHEMA }), 12340000)
    assert.strictEqual(load('-001234.56', { schema: CORE_SCHEMA }), -1234.56)
    assert.strictEqual(load('-001234e4', { schema: CORE_SCHEMA }), -12340000)
  })

  it('should parse 0o prefix as octal', () => {
    assert.strictEqual(load('0o1234', { schema: CORE_SCHEMA }), 668)
    // not valid octal
    assert.strictEqual(load('0o1289', { schema: CORE_SCHEMA }), '0o1289')
  })

  it('should parse YAML 1.1 sexagesimal int', () => {
    assert.strictEqual(load('1:23', { schema: YAML11_SCHEMA }), 83)
  })
})

describe('Should dump numbers in YAML 1.2 format', () => {
  it('should quote values resolved by YAML 1.1 or YAML 1.2 in the default schema', () => {
    const tests = '1:23 1:23.45 01234 0x123 0o123 1e2 1e+2 1.0e2'

    tests.split(' ').forEach((sample) => {
      assert.strictEqual(dump(sample), `'${sample}'\n`)
    })
  })

  it('should quote strings resolved as numbers by the selected schema', () => {
    const tests = '01234 0999 -01234 01234.56 -01234.56 0x123 0o123'

    tests.split(' ').forEach((sample) => {
      assert.strictEqual(dump(sample, { schema: CORE_SCHEMA }), `'${sample}'\n`)
    })

    assert.strictEqual(dump('01234e4', { schema: CORE_SCHEMA }), "'01234e4'\n")
  })

  it('should only quote base60 values when the schema resolves them', () => {
    const tests = '1:23'

    tests.split(' ').forEach((sample) => {
      assert.strictEqual(dump(sample, { schema: CORE_SCHEMA }), `${sample}\n`)
      assert.strictEqual(dump(sample, { schema: YAML11_SCHEMA }), `'${sample}'\n`)
    })

    assert.strictEqual(dump('1:23.45', { schema: CORE_SCHEMA }), '1:23.45\n')
    assert.strictEqual(dump('1:23.45', { schema: YAML11_SCHEMA }), "'1:23.45'\n")
    assert.strictEqual(dump('0o123', { schema: YAML11_SCHEMA }), '0o123\n')
    assert.strictEqual(dump('1e2', { schema: YAML11_SCHEMA }), '1e2\n')
  })
})
