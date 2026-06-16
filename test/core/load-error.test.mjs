import { describe, it } from 'node:test'

import assert from 'node:assert'
import { loadAll, YAMLException } from 'js-yaml'

const samples = [
  {
    name: 'duplicate tag directive',
    source: `%TAG    !foo!   bar
%TAG    !foo!   baz
--- foo
`
  },
  {
    name: 'invalid starting character',
    source: '@@@@@@@@@@@@@@@@@@@\n'
  },
  {
    name: 'expected scalar',
    source: '--- !!str [not a scalar]\n'
  },
  {
    name: 'invalid directive name',
    source: `%   # no name at all
---
`
  },
  {
    name: 'invalid escape numbers',
    source: String.raw`"hm.... \u123?"` + '\n'
  },
  {
    name: 'invalid anchor in flow collection',
    source: `---
- [
    &correct foo,
    *correct,
    *correct]   # still correct
- *correct: still correct
- &correct-or-not[foo, bar]
`
  },
  {
    name: 'invalid tag directive handle',
    source: `%TAG !!! !!!
---
`
  },
  {
    name: 'invalid tag handle',
    source: `%TAG    foo bar
---
`
  },
  {
    name: 'invalid uri escapes',
    source: '--- !<tag:%x?y> foo\n'
  },
  {
    name: 'invalid yaml version',
    source: `%YAML   2.0
--- foo
`
  },
  {
    name: 'no flow mapping end',
    source: '{ foo: bar ]\n'
  },
  {
    name: 'no node in nested flow collection',
    source: '- [ !foo } ]\n'
  },
  {
    name: 'no node with explicit tag',
    source: '- !foo ]\n'
  },
  {
    name: 'unclosed quoted scalar',
    source: `'foo
 bar
`
  },
  {
    name: 'undefined anchor',
    source: `- foo
- &bar baz
- *bat
`
  }
]

describe('load errors', () => {
  for (const sample of samples) {
    it(sample.name, () => {
      assert.throws(() => {
        loadAll(
          sample.source,
          () => {},
          { filename: `${sample.name}.yml` }
        )
      }, YAMLException)
    })
  }
})
