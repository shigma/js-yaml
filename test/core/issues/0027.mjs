import { describe, it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

describe('Should load numbers in YAML 1.2 format', function () {
  it('should not parse base60', function () {
    // previously parsed as int
    assert.strictEqual(load('1:23'), '1:23')
    // previously parsed as float
    assert.strictEqual(load('1:23.45'), '1:23.45')
  })

  it('should allow leading zero in int and float', function () {
    assert.strictEqual(load('01234'), 1234)
    assert.strictEqual(load('00999'), 999)
    assert.strictEqual(load('-00999'), -999)
    assert.strictEqual(load('001234.56'), 1234.56)
    assert.strictEqual(load('001234e4'), 12340000)
    assert.strictEqual(load('-001234.56'), -1234.56)
    assert.strictEqual(load('-001234e4'), -12340000)
  })

  it('should parse 0o prefix as octal', function () {
    assert.strictEqual(load('0o1234'), 668)
    // not valid octal
    assert.strictEqual(load('0o1289'), '0o1289')
  })
})

describe('Should dump numbers in YAML 1.2 format', function () {
  it('should dump in different styles', function () {
    assert.strictEqual(dump(123, { styles: { '!!int': 'binary' } }), '0b1111011\n')
    assert.strictEqual(dump(123, { styles: { '!!int': 'octal' } }), '0o173\n')
    assert.strictEqual(dump(123, { styles: { '!!int': 'hex' } }), '0x7B\n')
  })

  it('should quote all potential numbers', function () {
    const tests = '1:23 1:23.45 01234 0999 -01234 01234e4 01234.56 -01234.56 0x123 0o123'

    tests.split(' ').forEach(function (sample) {
      assert.strictEqual(dump(sample, { noCompatMode: false }), "'" + sample + "'\n")
    })
  })

  it('should not quote base60 in noCompatMode', function () {
    const tests = '1:23 1:23.45'

    tests.split(' ').forEach(function (sample) {
      assert.strictEqual(dump(sample, { noCompatMode: true }), sample + '\n')
    })
  })
})
