import { it } from 'node:test'

import assert from 'node:assert'
import { load, YAMLException } from 'js-yaml'

it('Allow astral characters', () => {
  assert.deepStrictEqual(load('𝑘𝑒𝑦: 𝑣𝑎𝑙𝑢𝑒'), { '𝑘𝑒𝑦': '𝑣𝑎𝑙𝑢𝑒' })
})

it('Forbid non-printable characters', () => {
  assert.throws(() => { load('\x01') }, YAMLException)
  assert.throws(() => { load('\x7f') }, YAMLException)
  assert.throws(() => { load('\x9f') }, YAMLException)
})

it('Forbid lone surrogates', () => {
  assert.throws(() => { load('\udc00\ud800') }, YAMLException)
})

it('Allow non-printable characters inside quoted scalars', () => {
  assert.strictEqual(load('"\x7f\x9f\udc00\ud800"'), '\x7f\x9f\udc00\ud800')
})

it('Forbid control sequences inside quoted scalars', () => {
  assert.throws(() => { load('"\x03"') }, YAMLException)
})
