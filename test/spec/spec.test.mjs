import { describe, it } from 'node:test'

import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSONParser } from '@streamparser/json'

import {
  load,
  loadAll,
  dump,
  EVENT_DOCUMENT,
  EVENT_SEQUENCE,
  EVENT_MAPPING,
  EVENT_SCALAR,
  EVENT_ALIAS,
  EVENT_POP,
  SCALAR_STYLE_SINGLE_QUOTED,
  SCALAR_STYLE_DOUBLE_QUOTED,
  SCALAR_STYLE_LITERAL_BLOCK,
  SCALAR_STYLE_FOLDED_BLOCK,
  COLLECTION_STYLE_FLOW,
  CORE_SCHEMA,
  strTag,
  seqTag,
  mapTag,
  createParserState,
  parseEvents,
  getScalarValue
} from 'js-yaml'

// The yaml-test-suite follows the libyaml convention: a tag outside the core
// schema is constructed by node kind (scalar→str, seq→seq, map→map), and its
// `json` field encodes that fallback value. The core loader instead rejects
// unknown tags, so to validate the suite's `json`/round-trip expectations we
// load with a schema that adds catch-all tags. These match by empty tag prefix,
// so they only fire for tags not already covered by the core schema. This is a
// test-only schema; it does not change how js-yaml loads by default.
const SPEC_SCHEMA = CORE_SCHEMA.withTags(
  { ...strTag, tagName: '', matchByTagPrefix: true },
  { ...seqTag, tagName: '', matchByTagPrefix: true },
  { ...mapTag, tagName: '', matchByTagPrefix: true }
)

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

function expectedTreeLines (tree) {
  const lines = []

  for (const line of tree.split('\n')) {
    const trimmed = line.trim()

    if (trimmed === '' || trimmed === '+STR' || trimmed === '-STR') continue
    // Significant (e.g. trailing) spaces in scalar values are visualized with ␣.
    lines.push(trimmed.replaceAll('␣', ' '))
  }

  return lines
}

function parseConcatenatedJson (str) {
  const results = []
  const parser = new JSONParser({ separator: '', paths: ['$'] })

  parser.onValue = ({ value }) => results.push(value)
  parser.write(str)

  return results
}

function escapeTreeValue (value) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\t', '\\t')
    .replaceAll('\b', '\\b')
}

function formatRange (input, start, end) {
  return start === -1 ? '' : input.slice(start, end)
}

const DEFAULT_TAG_HANDLES = { '!': '!', '!!': 'tag:yaml.org,2002:' }

function percentDecode (suffix) {
  return suffix.replace(/%([0-9A-Fa-f]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
}

// Resolve a raw tag (e.g. !foo, !!str, !e!tag%21, !<verbatim>) into its full
// form using the current document's TAG directives, mirroring what the
// yaml-test-suite tree expects. The parser stores raw tag ranges; the directives
// needed to resolve them are carried on the DOCUMENT event.
function formatTag (tag, tagDirectives) {
  if (tag === '') return ''
  if (tag.startsWith('!<') && tag.endsWith('>')) return `<${tag.slice(2, -1)}>`

  const handle = (/^(![\w-]*!|!)/.exec(tag))[1]
  const prefix = tagDirectives[handle] ?? DEFAULT_TAG_HANDLES[handle] ?? handle
  return `<${prefix}${percentDecode(tag.slice(handle.length))}>`
}

function formatProperties (input, event, tagDirectives) {
  const parts = []
  const anchor = formatRange(input, event.anchorStart, event.anchorEnd)
  const tag = formatRange(input, event.tagStart, event.tagEnd)

  if (anchor) parts.push(`&${anchor}`)
  if (tag) parts.push(formatTag(tag, tagDirectives))

  return parts.length > 0 ? `${parts.join(' ')} ` : ''
}

function scalarStyleMarker (style) {
  if (style === SCALAR_STYLE_SINGLE_QUOTED) return "'"
  if (style === SCALAR_STYLE_DOUBLE_QUOTED) return '"'
  if (style === SCALAR_STYLE_LITERAL_BLOCK) return '|'
  if (style === SCALAR_STYLE_FOLDED_BLOCK) return '>'
  return ':'
}

function actualTreeLines (input) {
  const state = createParserState(input)
  parseEvents(state)

  const lines = []
  const stack = []
  let tagDirectives = {}

  for (const event of state.events) {
    if (event.type === EVENT_DOCUMENT) {
      tagDirectives = event.tagDirectives
      lines.push(event.explicitStart ? '+DOC ---' : '+DOC')
      stack.push(event)
    } else if (event.type === EVENT_SEQUENCE) {
      const style = event.style === COLLECTION_STYLE_FLOW ? ' []' : ''
      const props = formatProperties(input, event, tagDirectives)
      lines.push(`+SEQ${style} ${props}`.replace(/\s+/g, ' ').trimEnd())
      stack.push(event)
    } else if (event.type === EVENT_MAPPING) {
      const style = event.style === COLLECTION_STYLE_FLOW ? ' {}' : ''
      const props = formatProperties(input, event, tagDirectives)
      lines.push(`+MAP${style} ${props}`.replace(/\s+/g, ' ').trimEnd())
      stack.push(event)
    } else if (event.type === EVENT_SCALAR) {
      const props = formatProperties(input, event, tagDirectives)
      const value = escapeTreeValue(getScalarValue(state, event))
      lines.push(`=VAL ${props}${scalarStyleMarker(event.style)}${value}`)
    } else if (event.type === EVENT_ALIAS) {
      lines.push(`=ALI *${formatRange(input, event.anchorStart, event.anchorEnd)}`)
    } else if (event.type === EVENT_POP) {
      const opened = stack.pop()

      if (opened?.type === EVENT_DOCUMENT) {
        lines.push(opened.explicitEnd ? '-DOC ...' : '-DOC')
      } else if (opened?.type === EVENT_SEQUENCE) {
        lines.push('-SEQ')
      } else if (opened?.type === EVENT_MAPPING) {
        lines.push('-MAP')
      }
    }
  }

  return lines
}

// Mirror YAMLTestSuite.pm: within a multi-document fixture file, each document
// inherits unset fields from the previous one via a rolling cache. `name`/`yaml`
// fall back through `||`; `tree`/`json`/`dump` are copied when the key is absent;
// `fail` is strictly local (never inherited). The merged fixture becomes the
// cache for the next document.
function mergeDefaults (fixture, cache) {
  const merged = { ...fixture }

  merged.name = merged.name || cache.name
  merged.yaml = merged.yaml || cache.yaml
  merged.fail = 'fail' in fixture

  for (const key of ['tree', 'json', 'dump']) {
    if (!(key in fixture) && cache[key] != null) merged[key] = cache[key]
  }

  return merged
}

describe('yaml-test-suite parser tree', () => {
  if (!fs.existsSync(srcDir)) {
    throw new Error('Missing yaml-test-suite fixtures. Run npm run spec:get first.')
  }

  for (const file of fs.readdirSync(srcDir).sort()) {
    if (path.extname(file) !== '.yaml') continue

    const id = path.basename(file, '.yaml')
    const fixtureFile = path.join(srcDir, file)
    const fixtures = load(fs.readFileSync(fixtureFile, 'utf8'), { filename: fixtureFile })

    // A `skip: true` on the first document means the whole file is excluded from
    // the suite; keep one visible marker so it isn't dropped silently.
    if (fixtures[0]?.skip) {
      describe(id, () => {
        it(id, { skip: 'suite marks file skip' }, () => {})
      })
      continue
    }

    let cache = {}

    fixtures.forEach((rawFixture, index) => {
      const fixture = mergeDefaults(rawFixture, cache)
      cache = fixture

      const suffix = fixtures.length > 1 ? `/${String(index).padStart(2, '0')}` : ''

      // Positively annotate the reduced sets; the full tree+json+round-trip case
      // carries no suffix.
      let annotation = ''
      if (fixture.fail) annotation = ' (invalid)'
      else if (fixture.json == null) annotation = ' (tree only)'

      const title = `${id}${suffix} ${fixture.name || id}${annotation}`

      describe(title, () => {
        if (fixture.fail) {
          it(`${id} tree`, () => {
            const input = unescapeFixtureText(fixture.yaml)

            assert.throws(() => actualTreeLines(input))
          })

          it(`${id} json`, () => {
            const input = unescapeFixtureText(fixture.yaml)

            assert.throws(() => loadAll(input))
          })
          return
        }

        // After inheritance a non-fail fixture must carry at least a `tree`
        // (usually also a `json`). Neither present means nothing to assert,
        // which signals a broken merge or an unexpected suite shape — fail loud.
        if (fixture.tree == null && fixture.json == null) {
          it(`${id} usable`, () => {
            assert.fail('fixture has no usable expectation after merge')
          })
          return
        }

        it(`${id} tree`, () => {
          const input = unescapeFixtureText(fixture.yaml)

          assert.deepStrictEqual(actualTreeLines(input), expectedTreeLines(fixture.tree))
        })

        if (fixture.json == null) return

        it(`${id} json`, () => {
          const input = unescapeFixtureText(fixture.yaml)
          const result = loadAll(input, { schema: SPEC_SCHEMA })
          const expected = parseConcatenatedJson(unescapeFixtureText(fixture.json))

          assert.deepStrictEqual(result, expected)
        })

        it(`${id} round-trip`, () => {
          const input = unescapeFixtureText(fixture.yaml)
          const docs = loadAll(input, { schema: SPEC_SCHEMA })

          // dump() emits a single document without a `---` marker, so join
          // multi-document fixtures with explicit markers before reloading.
          const dumped = docs.map(doc => `---\n${dump(doc)}`).join('')

          assert.deepStrictEqual(loadAll(dumped, { schema: SPEC_SCHEMA }), docs)
        })
      })
    })
  }
})
