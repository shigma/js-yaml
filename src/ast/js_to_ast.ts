// JS value graph → AST. Knows tags (`identify` / `represent`). A single
// identity-`Map` walk handles dedup: a repeat occurrence of an object (including
// a cycle) becomes an `alias`, and the first occurrence gets an `anchor`.

import YAMLException from '../exception.ts'
import { type Schema } from '../schema.ts'
import { type TagDefinition } from '../tag.ts'
import {
  IMPLICIT,
  type Node,
  type ScalarNode,
  type SequenceNode,
  type MappingNode
} from './nodes.ts'

const _hasOwnProperty = Object.prototype.hasOwnProperty

interface JsToAstOptions {
  styles?: { [tag: string]: string } | null
  noRefs?: boolean
  skipInvalid?: boolean
}

// A match candidate. `implicitTag` means the tag is not printed (implicit
// scalars and the default str/seq/map tags).
interface RepresentType {
  tag: TagDefinition
  implicitTag: boolean
}

// Returned by `build` when no tag matched.
const INVALID = Symbol('INVALID')

interface BuildState {
  representTypes: RepresentType[]
  styleMap: Record<string, string>
  noRefs: boolean
  skipInvalid: boolean

  // Already-built collection values → their node, for anchor/alias dedup.
  refs: Map<unknown, Node>
  refCounter: number
}

function compileStyleMap (schema: Schema, map: { [tag: string]: string } | null | undefined): Record<string, string> {
  if (!map) return {}

  const result: Record<string, string> = {}
  const keys = Object.keys(map)

  for (let index = 0, length = keys.length; index < length; index += 1) {
    let tag = keys[index]
    let style = map[tag]

    if (tag.slice(0, 2) === '!!') {
      tag = `tag:yaml.org,2002:${tag.slice(2)}`
    }
    const tagDefinition = schema.exact.scalar[tag] ?? schema.exact.sequence[tag] ?? schema.exact.mapping[tag]

    if (tagDefinition && _hasOwnProperty.call(tagDefinition.styleAliases, style)) {
      style = tagDefinition.styleAliases[style]
    }

    result[tag] = style
  }

  return result
}

function buildRepresentTypes (schema: Schema): RepresentType[] {
  const defaultTags = new Set<TagDefinition>([
    schema.defaultScalarTag,
    schema.defaultSequenceTag,
    schema.defaultMappingTag
  ].filter((t): t is TagDefinition => t !== undefined))

  // Default container/str tags go last so a more specific tag identifying the
  // same JS value (e.g. a custom tag on a plain object) wins.
  const implicitScalars = schema.implicitScalarTags
  const explicitTags = schema.tags.filter(t =>
    !(t.nodeKind === 'scalar' && t.implicit) && !defaultTags.has(t))
  const defaultTagsLast = schema.tags.filter(t => defaultTags.has(t))

  return [
    ...implicitScalars.map(tag => ({ tag, implicitTag: true })),
    ...explicitTags.map(tag => ({ tag, implicitTag: false })),
    ...defaultTagsLast.map(tag => ({ tag, implicitTag: true }))
  ]
}

// First tag whose `identify` accepts `object`.
function matchTag (state: BuildState, object: unknown): { tag: TagDefinition, tagName: string, implicitTag: boolean } | null {
  for (let index = 0, length = state.representTypes.length; index < length; index += 1) {
    const { tag, implicitTag } = state.representTypes[index]

    if (tag.identify && tag.identify(object)) {
      let tagName: string
      if (implicitTag) {
        tagName = IMPLICIT
      } else if (tag.matchByTagPrefix && tag.representTagName) {
        tagName = tag.representTagName(object)
      } else {
        tagName = tag.tagName
      }
      return { tag, tagName, implicitTag }
    }
  }

  return null
}

// Run a tag's `represent` under the per-tag style. Returns the output (scalar
// text, or the array/`Map` container) and the style key used (`format`).
function applyRepresent (state: BuildState, tag: TagDefinition, object: unknown) {
  const represent = tag.represent
  // No represent: the value is already its canonical form (default str/seq/map).
  if (!represent) return { value: object, format: null }

  const style = state.styleMap[tag.tagName] || tag.defaultStyle

  let value
  if (typeof represent === 'function') {
    value = style ? represent(object, style) : represent(object)
  } else if (style && _hasOwnProperty.call(represent, style)) {
    value = represent[style](object, style)
  } else {
    throw new YAMLException(`!<${tag.tagName}> tag resolver does not accept "${style}" style`)
  }

  return { value, format: style }
}

// Build a node for `object`, or INVALID when no tag matches. `undefined` never
// throws (caller decides: null in a sequence, skip in a mapping, '' at root);
// any other unrepresentable value throws unless `skipInvalid`.
function build (state: BuildState, object: unknown): Node | typeof INVALID {
  if (!state.noRefs && object !== null && typeof object === 'object') {
    const existing = state.refs.get(object)
    if (existing) {
      if (existing.anchor === undefined) existing.anchor = `ref_${state.refCounter++}`
      return { kind: 'alias', tag: '', anchor: existing.anchor }
    }
  }

  const matched = matchTag(state, object)

  if (!matched) {
    if (object === undefined) return INVALID
    if (state.skipInvalid) return INVALID
    throw new YAMLException(`unacceptable kind of an object to dump ${Object.prototype.toString.call(object)}`)
  }

  const { tag, tagName, implicitTag } = matched

  if (tag.nodeKind === 'scalar') {
    const { value, format } = applyRepresent(state, tag, object)
    const node: ScalarNode = {
      kind: 'scalar',
      tag: tagName,
      value: typeof value === 'string' ? value : String(value)
    }
    if (format !== null) node.format = format
    // Implicit scalars with a `represent` already hold their final text — force
    // plain so `present` prints it verbatim instead of restyling. str and
    // explicit-tagged scalars leave `style` unset for `present` to choose.
    if (implicitTag && tag.represent) node.style = 'plain'
    return node
  }

  if (tag.nodeKind === 'sequence') {
    const container = applyRepresent(state, tag, object).value
    const node: SequenceNode = { kind: 'sequence', tag: tagName, items: [] }
    if (!state.noRefs) state.refs.set(object, node)

    for (let index = 0, length = container.length; index < length; index += 1) {
      let item = build(state, container[index])
      // An invalid element becomes null; a still-invalid null then skips/throws.
      if (item === INVALID && container[index] === undefined) item = build(state, null)
      if (item === INVALID) continue
      node.items.push(item)
    }
    return node
  }

  // mapping — the canonical form is always a `Map`.
  const map: Map<unknown, unknown> = applyRepresent(state, tag, object).value
  const node: MappingNode = { kind: 'mapping', tag: tagName, items: [] }
  if (!state.noRefs) state.refs.set(object, node)

  for (const [objectKey, objectValue] of map) {
    const key = build(state, objectKey)
    if (key === INVALID) continue // invalid key skips the pair
    const value = build(state, objectValue)
    if (value === INVALID) continue // invalid value skips the pair
    node.items.push({ key, value })
  }
  return node
}

// Returns null when the input itself can't be represented (caller emits '').
function jsToAst (input: unknown, schema: Schema, options: JsToAstOptions = {}): Node | null {
  const state: BuildState = {
    representTypes: buildRepresentTypes(schema),
    styleMap: compileStyleMap(schema, options.styles),
    noRefs: options.noRefs ?? false,
    skipInvalid: options.skipInvalid ?? false,
    refs: new Map(),
    refCounter: 0
  }

  const root = build(state, input)
  return root === INVALID ? null : root
}

export {
  jsToAst,
  type JsToAstOptions
}
