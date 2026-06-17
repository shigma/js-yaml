import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  tagPercentEncode,
  tagPercentDecode,
  tagNameFull,
  tagNameShort,
  nodeTagShort
} from '../../../src/ast/tagname_tools.ts'

const YAML_PREFIX = 'tag:yaml.org,2002:'

// Minimal Node stand-in: the node helpers only read `tag` and `style.tagged`.
const tagged = tag => ({ tag, style: { tagged: true } })
const untagged = tag => ({ tag, style: { tagged: false } })

describe('tagname_tools', () => {
  describe('tagNameFull', () => {
    it('expands the default handles to their prefixes', () => {
      assert.equal(tagNameFull('!!str'), `${YAML_PREFIX}str`)
      assert.equal(tagNameFull('!!map'), `${YAML_PREFIX}map`)
    })

    it('keeps a primary-handle (local) tag verbatim', () => {
      assert.equal(tagNameFull('!local'), '!local')
      assert.equal(tagNameFull('!'), '!')
    })

    it('unwraps a verbatim tag', () => {
      assert.equal(tagNameFull(`!<${YAML_PREFIX}str>`), `${YAML_PREFIX}str`)
      assert.equal(tagNameFull('!<!foo>'), '!foo')
    })

    it('resolves a registered custom handle', () => {
      const handlers = { '!e!': 'tag:example.com,2024:' }
      assert.equal(tagNameFull('!e!foo', handlers), 'tag:example.com,2024:foo')
    })

    it('lets user handles override the defaults', () => {
      const handlers = { '!!': 'tag:custom,1:' }
      assert.equal(tagNameFull('!!str', handlers), 'tag:custom,1:str')
    })

    it('leaves an unregistered named handle untouched', () => {
      // No matching user or default handle -> prefix falls back to the handle itself.
      assert.equal(tagNameFull('!x!foo'), '!x!foo')
    })

    it('percent-decodes the resolved name', () => {
      assert.equal(tagNameFull('!foo%20bar'), '!foo bar')
      assert.equal(tagNameFull('!%E2%9C%93'), '!✓') // checkmark
    })
  })

  describe('tagNameShort', () => {
    it('shortens the yaml.org prefix to "!!"', () => {
      assert.equal(tagNameShort(`${YAML_PREFIX}str`), '!!str')
      assert.equal(tagNameShort(`${YAML_PREFIX}`), '!!')
    })

    it('keeps a local "!" tag, re-encoding its body', () => {
      assert.equal(tagNameShort('!local'), '!local')
      assert.equal(tagNameShort('!foo bar'), '!foo%20bar')
    })

    it('wraps any other tag as verbatim', () => {
      assert.equal(tagNameShort('tag:example.com,2024:foo'), '!<tag:example.com,2024:foo>')
    })
  })

  describe('tagPercentEncode / tagPercentDecode', () => {
    it('escapes spaces and "!"', () => {
      assert.equal(tagPercentEncode('foo bar'), 'foo%20bar')
      assert.equal(tagPercentEncode('a!b'), 'a%21b')
    })

    it('leaves URI-safe characters alone', () => {
      assert.equal(tagPercentEncode("a-b_c.d~e*'()"), "a-b_c.d~e*'()")
    })

    it('round-trips arbitrary text', () => {
      for (const s of ['foo bar', 'a!b', 'tag:yaml.org,2002:str', '✓ é']) {
        assert.equal(tagPercentDecode(tagPercentEncode(s)), s)
      }
    })
  })

  describe('nodeTagShort', () => {
    it('returns the raw spelling of a tagged node unchanged', () => {
      assert.equal(nodeTagShort(tagged('!!str')), '!!str')
      assert.equal(nodeTagShort(tagged('!local')), '!local')
    })

    it('shortens the resolved tag of an untagged node', () => {
      assert.equal(nodeTagShort(untagged(`${YAML_PREFIX}str`)), '!!str')
      assert.equal(nodeTagShort(untagged('tag:example.com,2024:foo')), '!<tag:example.com,2024:foo>')
    })
  })

  describe('round-trips between full and short forms', () => {
    it('tagNameShort(tagNameFull(x)) recovers the canonical short form', () => {
      assert.equal(tagNameShort(tagNameFull('!!str')), '!!str')
      assert.equal(tagNameShort(tagNameFull('!local')), '!local')
      assert.equal(tagNameShort(tagNameFull(`!<${YAML_PREFIX}seq>`)), '!!seq')
    })

    it('tagNameFull(tagNameShort(x)) recovers the resolved name', () => {
      for (const full of [`${YAML_PREFIX}str`, '!local', 'tag:example.com,2024:foo']) {
        assert.equal(tagNameFull(tagNameShort(full)), full)
      }
    })
  })
})
