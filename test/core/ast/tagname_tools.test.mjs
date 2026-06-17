import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  tagPercentEncode,
  tagPercentDecode,
  tagNameFull,
  tagNameShort,
  tagCheckError,
  nodeTagFull,
  nodeTagShort
} from '../../../src/ast/tagname_tools.ts'

const YAML_PREFIX = 'tag:yaml.org,2002:'

// Minimal Node stand-in: the node helpers only read `tag` and `style.tagged`.
const tagged = tag => ({ tag, style: { tagged: true } })
const untagged = tag => ({ tag, style: { tagged: false } })

describe('tagname_tools', () => {
  describe('tagCheckError', () => {
    it('accepts the standard tag spellings', () => {
      assert.equal(tagCheckError('!!str'), null)              // secondary handle
      assert.equal(tagCheckError('!local'), null)             // primary handle
      assert.equal(tagCheckError('!e!suffix'), null)          // named handle
      assert.equal(tagCheckError('!'), null)                  // non-specific tag
      assert.equal(tagCheckError(`!<${YAML_PREFIX}str>`), null) // verbatim
    })

    it('accepts every character the URI grammar allows in a suffix', () => {
      assert.equal(tagCheckError("!!a-b_c.d~e*f'g(h)i"), null)
      assert.equal(tagCheckError('!!a%20b'), null) // percent-escaped space
    })

    it('rejects an empty tag', () => {
      assert.equal(tagCheckError(''), 'tag is empty')
    })

    it('rejects a tag not starting with "!"', () => {
      assert.equal(tagCheckError('foo'), 'tag must start with "!": foo')
      assert.equal(tagCheckError(' !foo'), 'tag must start with "!":  !foo')
    })

    it('rejects an unclosed verbatim tag', () => {
      assert.equal(tagCheckError(`!<${YAML_PREFIX}str`), `verbatim tag is not closed: !<${YAML_PREFIX}str`)
    })

    it('accepts a verbatim tag with an empty body', () => {
      // "!<>" is structurally closed; emptiness is not this function's concern.
      assert.equal(tagCheckError('!<>'), null)
    })

    it('rejects an exclamation mark inside a handled suffix', () => {
      assert.equal(tagCheckError('!!foo!bar'), 'tag suffix cannot contain exclamation marks')
    })

    it('allows exclamation marks inside a verbatim body', () => {
      // The "no !" rule applies to handled tags, not verbatim ones.
      assert.equal(tagCheckError('!<!foo!>'), null)
    })

    it('rejects illegal characters in the suffix', () => {
      assert.equal(tagCheckError('!!foo bar'), 'tag name cannot contain such characters: foo bar')
      assert.equal(tagCheckError('!!foo^bar'), 'tag name cannot contain such characters: foo^bar')
    })

    it('rejects a malformed percent-encoding', () => {
      assert.equal(tagCheckError('!!foo%2'), 'tag name is malformed: !!foo%2')
      assert.equal(tagCheckError('!!foo%zz'), 'tag name is malformed: !!foo%zz')
    })
  })

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
      const handles = [{ handle: '!e!', prefix: 'tag:example.com,2024:' }]
      assert.equal(tagNameFull('!e!foo', handles), 'tag:example.com,2024:foo')
    })

    it('lets user handles override the defaults', () => {
      const handles = [{ handle: '!!', prefix: 'tag:custom,1:' }]
      assert.equal(tagNameFull('!!str', handles), 'tag:custom,1:str')
    })

    it('leaves an unregistered named handle untouched', () => {
      // No matching user or default handle -> prefix falls back to the handle itself.
      assert.equal(tagNameFull('!x!foo'), '!x!foo')
    })

    it('percent-decodes the resolved name', () => {
      assert.equal(tagNameFull('!foo%20bar'), '!foo bar')
      assert.equal(tagNameFull('!%E2%9C%93'), '!✓') // checkmark
    })

    it('throws on a structurally invalid tag', () => {
      assert.throws(() => tagNameFull(''), /tag is empty/)
      assert.throws(() => tagNameFull('!!a b'), /tag name cannot contain such characters/)
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

  describe('nodeTagFull', () => {
    it('expands the raw spelling carried by a tagged node', () => {
      assert.equal(nodeTagFull(tagged('!!str')), `${YAML_PREFIX}str`)
      assert.equal(nodeTagFull(tagged(`!<${YAML_PREFIX}map>`)), `${YAML_PREFIX}map`)
    })

    it('honors custom handles when expanding a tagged node', () => {
      const handles = [{ handle: '!e!', prefix: 'tag:example.com,2024:' }]
      assert.equal(nodeTagFull(tagged('!e!foo'), handles), 'tag:example.com,2024:foo')
    })

    it('returns the already-resolved tag of an untagged node unchanged', () => {
      assert.equal(nodeTagFull(untagged(`${YAML_PREFIX}str`)), `${YAML_PREFIX}str`)
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
