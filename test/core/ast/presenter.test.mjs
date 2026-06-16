import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  dump,
  load,
  defineScalarTag,
  createParserState,
  parseEvents,
  jsToAst,
  eventsToAst,
  present,
  CORE_SCHEMA,
  nullCoreTag
} from 'js-yaml'

function presentParsed (input) {
  const state = createParserState(input)
  parseEvents(state)
  return present(eventsToAst(state, { schema: CORE_SCHEMA }), { schema: CORE_SCHEMA })
}

describe('ast presenter', () => {
  it('keeps quoteFlowKeys outside an explicit long flow key', () => {
    const key = `${'a'.repeat(1024)}\nb`
    const node = jsToAst({ [key]: 'value' }, CORE_SCHEMA)

    assert.equal(node?.kind, 'mapping')
    node.style.flow = true

    const output = present([{ contents: node }], { schema: CORE_SCHEMA, quoteFlowKeys: true })

    assert.equal(output, `{? "${'a'.repeat(1024)}\\nb": value}\n`)
    assert.deepEqual(load(output, { schema: CORE_SCHEMA }), { [key]: 'value' })
  })

  it('prints document directives before the document marker', () => {
    const contents = jsToAst('bar', CORE_SCHEMA)
    const output = present([{
      version: '1.2',
      tagHandles: [{ handle: '!e!', prefix: 'tag:example.com,2024:' }],
      contents
    }], { schema: CORE_SCHEMA })

    assert.equal(output, '%YAML 1.2\n%TAG !e! tag:example.com,2024:\n---\nbar\n')
  })

  it('keeps explicit parsed tag spelling', () => {
    assert.equal(presentParsed('!!str 123\n'), '!!str 123\n')
    assert.equal(presentParsed('!!%73tr 123\n'), '!!%73tr 123\n')
    assert.equal(presentParsed('!<tag:yaml.org,2002:str> 123\n'), '!<tag:yaml.org,2002:str> 123\n')
    assert.equal(presentParsed('! 123\n'), '! 123\n')
  })

  it('keeps explicit parsed tag handles with directives', () => {
    const input = '%TAG !e! tag:example.com,2024:\n--- !e!foo bar\n'

    assert.equal(presentParsed(input), '%TAG !e! tag:example.com,2024:\n---\n!e!foo bar\n')
  })

  it('prints explicit from_js tags in printable form', () => {
    const customTag = defineScalarTag('!custom', {
      resolve: source => source,
      identify: object => object && object.custom === true,
      represent: object => object.value
    })
    const schema = CORE_SCHEMA.withTags(customTag)

    assert.equal(dump({ custom: true, value: 'ok' }, { schema }), '!custom ok\n')
    assert.equal(dump(new Uint8Array([1, 2, 3])), '!!binary AQID\n')
  })

  it('renders an empty scalar without a trailing space', () => {
    // null tag whose represent renders nothing — `key:` / `- ` with no value.
    const schema = CORE_SCHEMA.withTags({ ...nullCoreTag, represent: () => '' })

    // null → '' in a mapping / sequence: `a:` / `- a:`, never `a: ` / `- a: `.
    assert.equal(dump({ a: null }, { schema }), 'a:\n')
    assert.equal(dump([{ a: null }], { schema }), '- a:\n')

    // A real empty string stays quoted, distinct from null/empty.
    assert.equal(dump({ a: '' }, { schema }), "a: ''\n")
  })
})
