// AST → text. Walks the node `kind`; the scalar machinery (style selection,
// quoting, folding) is driven by node text, not by sniffing a JS value.

import YAMLException from '../exception.ts'
import { type Schema } from '../schema.ts'
import { NOT_RESOLVED, type ScalarTagDefinition } from '../tag.ts'
import {
  IMPLICIT,
  type Node,
  type ScalarNode,
  type SequenceNode,
  type MappingNode,
  type ScalarStyle
} from './nodes.ts'

const _hasOwnProperty = Object.prototype.hasOwnProperty

const CHAR_BOM = 0xFEFF
const CHAR_TAB = 0x09 /* Tab */
const CHAR_LINE_FEED = 0x0A /* LF */
const CHAR_CARRIAGE_RETURN = 0x0D /* CR */
const CHAR_SPACE = 0x20 /* Space */
const CHAR_EXCLAMATION = 0x21 /* ! */
const CHAR_DOUBLE_QUOTE = 0x22 /* " */
const CHAR_SHARP = 0x23 /* # */
const CHAR_PERCENT = 0x25 /* % */
const CHAR_AMPERSAND = 0x26 /* & */
const CHAR_SINGLE_QUOTE = 0x27 /* ' */
const CHAR_ASTERISK = 0x2A /* * */
const CHAR_COMMA = 0x2C /* , */
const CHAR_MINUS = 0x2D /* - */
const CHAR_COLON = 0x3A /* : */
const CHAR_EQUALS = 0x3D /* = */
const CHAR_GREATER_THAN = 0x3E /* > */
const CHAR_QUESTION = 0x3F /* ? */
const CHAR_COMMERCIAL_AT = 0x40 /* @ */
const CHAR_LEFT_SQUARE_BRACKET = 0x5B /* [ */
const CHAR_RIGHT_SQUARE_BRACKET = 0x5D /* ] */
const CHAR_GRAVE_ACCENT = 0x60 /* ` */
const CHAR_LEFT_CURLY_BRACKET = 0x7B /* { */
const CHAR_VERTICAL_LINE = 0x7C /* | */
const CHAR_RIGHT_CURLY_BRACKET = 0x7D /* } */

const ESCAPE_SEQUENCES: Record<number, string> = {}

ESCAPE_SEQUENCES[0x00] = '\\0'
ESCAPE_SEQUENCES[0x07] = '\\a'
ESCAPE_SEQUENCES[0x08] = '\\b'
ESCAPE_SEQUENCES[0x09] = '\\t'
ESCAPE_SEQUENCES[0x0A] = '\\n'
ESCAPE_SEQUENCES[0x0B] = '\\v'
ESCAPE_SEQUENCES[0x0C] = '\\f'
ESCAPE_SEQUENCES[0x0D] = '\\r'
ESCAPE_SEQUENCES[0x1B] = '\\e'
ESCAPE_SEQUENCES[0x22] = '\\"'
ESCAPE_SEQUENCES[0x5C] = '\\\\'
ESCAPE_SEQUENCES[0x85] = '\\N'
ESCAPE_SEQUENCES[0xA0] = '\\_'
ESCAPE_SEQUENCES[0x2028] = '\\L'
ESCAPE_SEQUENCES[0x2029] = '\\P'

const DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
]

const DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/

const QUOTING_TYPE_SINGLE = "'"
const QUOTING_TYPE_DOUBLE = '"'

interface PresentOptions {
  schema: Schema
  indent?: number
  noArrayIndent?: boolean
  flowLevel?: number
  sortKeys?: boolean | ((a: any, b: any) => number)
  lineWidth?: number
  noCompatMode?: boolean
  condenseFlow?: boolean
  quotingType?: "'" | '"'
  forceQuotes?: boolean
}

interface PresentState {
  indent: number
  noArrayIndent: boolean
  flowLevel: number
  sortKeys: boolean | ((a: any, b: any) => number)
  lineWidth: number
  noCompatMode: boolean
  condenseFlow: boolean
  quotingType: "'" | '"'
  forceQuotes: boolean
  // Used to test whether a plain scalar would re-parse as another type.
  implicitResolvers: readonly ScalarTagDefinition[]
}

function createPresentState (options: PresentOptions): PresentState {
  return {
    indent: options.indent ?? 2,
    noArrayIndent: options.noArrayIndent ?? false,
    flowLevel: options.flowLevel ?? -1,
    sortKeys: options.sortKeys ?? false,
    lineWidth: options.lineWidth ?? 80,
    noCompatMode: options.noCompatMode ?? false,
    condenseFlow: options.condenseFlow ?? false,
    quotingType: options.quotingType ?? "'",
    forceQuotes: options.forceQuotes ?? false,
    implicitResolvers: options.schema.implicitScalarTags
  }
}

function encodeHex (character: number) {
  let handle
  let length

  const string = character.toString(16).toUpperCase()

  if (character <= 0xFF) {
    handle = 'x'
    length = 2
  } else if (character <= 0xFFFF) {
    handle = 'u'
    length = 4
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U'
    length = 8
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF')
  }

  return `\\${handle}${'0'.repeat(length - string.length)}${string}`
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString (string: string, spaces: number) {
  const ind = ' '.repeat(spaces)
  let position = 0
  let result = ''
  const length = string.length

  while (position < length) {
    let line
    const next = string.indexOf('\n', position)
    if (next === -1) {
      line = string.slice(position)
      position = length
    } else {
      line = string.slice(position, next + 1)
      position = next + 1
    }

    if (line.length && line !== '\n') result += ind

    result += line
  }

  return result
}

function generateNextLine (state: PresentState, level: number) {
  return `\n${' '.repeat(state.indent * level)}`
}

function testImplicitResolving (state: PresentState, str: string) {
  for (let index = 0, length = state.implicitResolvers.length; index < length; index += 1) {
    const tagDefinition = state.implicitResolvers[index]

    if (tagDefinition.resolve(str, tagDefinition.tagName) !== NOT_RESOLVED) {
      return true
    }
  }

  return false
}

// [33] s-white ::= s-space | s-tab
function isWhitespace (c: number) {
  return c === CHAR_SPACE || c === CHAR_TAB
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable (c: number) {
  return (c >= 0x00020 && c <= 0x00007E) ||
    ((c >= 0x000A1 && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029) ||
    ((c >= 0x0E000 && c <= 0x00FFFD) && c !== CHAR_BOM) ||
    (c >= 0x10000 && c <= 0x10FFFF)
}

// [34] ns-char ::= nb-char - s-white
// [27] nb-char ::= c-printable - b-char - c-byte-order-mark
// [26] b-char  ::= b-line-feed | b-carriage-return
// Including s-white (for some reason, examples doesn't match specs in this aspect)
// ns-char ::= c-printable - b-line-feed - b-carriage-return - c-byte-order-mark
function isNsCharOrWhitespace (c: number) {
  return isPrintable(c) &&
    c !== CHAR_BOM &&
    // - b-char
    c !== CHAR_CARRIAGE_RETURN &&
    c !== CHAR_LINE_FEED
}

// [127]  ns-plain-safe(c) ::= c = flow-out  ⇒ ns-plain-safe-out
//                             c = flow-in   ⇒ ns-plain-safe-in
//                             c = block-key ⇒ ns-plain-safe-out
//                             c = flow-key  ⇒ ns-plain-safe-in
// [128] ns-plain-safe-out ::= ns-char
// [129]  ns-plain-safe-in ::= ns-char - c-flow-indicator
// [130]  ns-plain-char(c) ::=  ( ns-plain-safe(c) - “:” - “#” )
//                            | ( /* An ns-char preceding */ “#” )
//                            | ( “:” /* Followed by an ns-plain-safe(c) */ )
// `prev` is the previous code point, or -1 when `c` is the first character
// (no preceding character). -1 is not a valid code point, so it can never
// collide with a real one and safely disables the prev-dependent cases below.
function isPlainSafe (c: number, prev: number, inblock: boolean) {
  const cIsNsCharOrWhitespace = isNsCharOrWhitespace(c)
  const cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c)
  return (
    (
      // ns-plain-safe
      inblock // c = flow-in
        ? cIsNsCharOrWhitespace
        : cIsNsCharOrWhitespace &&
          // - c-flow-indicator
          c !== CHAR_COMMA &&
          c !== CHAR_LEFT_SQUARE_BRACKET &&
          c !== CHAR_RIGHT_SQUARE_BRACKET &&
          c !== CHAR_LEFT_CURLY_BRACKET &&
          c !== CHAR_RIGHT_CURLY_BRACKET
    ) &&
    // ns-plain-char
    c !== CHAR_SHARP && // false on '#'
    !(prev === CHAR_COLON && !cIsNsChar)
  ) || // false on ': '
  (isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP) || // change to true on '[^ ]#'
  (prev === CHAR_COLON && cIsNsChar) // change to true on ':[^ ]'
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst (c: number) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  // No support of ( ( “?” | “:” | “-” ) /* Followed by an ns-plain-safe(c)) */ ) part
  return isPrintable(c) &&
    c !== CHAR_BOM &&
    !isWhitespace(c) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    c !== CHAR_MINUS &&
    c !== CHAR_QUESTION &&
    c !== CHAR_COLON &&
    c !== CHAR_COMMA &&
    c !== CHAR_LEFT_SQUARE_BRACKET &&
    c !== CHAR_RIGHT_SQUARE_BRACKET &&
    c !== CHAR_LEFT_CURLY_BRACKET &&
    c !== CHAR_RIGHT_CURLY_BRACKET &&
    // | “#” | “&” | “*” | “!” | “|” | “=” | “>” | “'” | “"”
    c !== CHAR_SHARP &&
    c !== CHAR_AMPERSAND &&
    c !== CHAR_ASTERISK &&
    c !== CHAR_EXCLAMATION &&
    c !== CHAR_VERTICAL_LINE &&
    c !== CHAR_EQUALS &&
    c !== CHAR_GREATER_THAN &&
    c !== CHAR_SINGLE_QUOTE &&
    c !== CHAR_DOUBLE_QUOTE &&
    // | “%” | “@” | “`”)
    c !== CHAR_PERCENT &&
    c !== CHAR_COMMERCIAL_AT &&
    c !== CHAR_GRAVE_ACCENT
}

// Simplified test for values allowed as the last character in plain style.
function isPlainSafeLast (c: number) {
  // just not whitespace or colon, it will be checked to be plain character later
  return !isWhitespace(c) && c !== CHAR_COLON
}

// Same as 'string'.codePointAt(pos), but works in older browsers.
function codePointAt (string: string, pos: number) {
  const first = string.charCodeAt(pos)
  let second

  if (first >= 0xD800 && first <= 0xDBFF && pos + 1 < string.length) {
    second = string.charCodeAt(pos + 1)
    if (second >= 0xDC00 && second <= 0xDFFF) {
      // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
      return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000
    }
  }
  return first
}

// Determines whether block indentation indicator is required.
function needIndentIndicator (string: string) {
  const leadingSpaceRe = /^\n* /
  return leadingSpaceRe.test(string)
}

const STYLE_PLAIN = 1
const STYLE_SINGLE = 2
const STYLE_LITERAL = 3
const STYLE_FOLDED = 4
const STYLE_DOUBLE = 5

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle (string: string, singleLineOnly: boolean, indentPerLevel: number, lineWidth: number,
  testAmbiguousType: (s: string) => boolean, quotingType: PresentState['quotingType'], forceQuotes: boolean, inblock: boolean) {
  let i
  let char = 0
  let prevChar = -1 // -1 = no previous character yet (see isPlainSafe)
  let hasLineBreak = false
  let hasFoldableLine = false // only checked if shouldTrackWidth
  const shouldTrackWidth = lineWidth !== -1
  let previousLineBreak = -1 // count the first line correctly
  let plain = isPlainSafeFirst(codePointAt(string, 0)) &&
    isPlainSafeLast(codePointAt(string, string.length - 1))

  if (singleLineOnly || forceQuotes) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i)
      if (!isPrintable(char)) {
        return STYLE_DOUBLE
      }
      plain = plain && isPlainSafe(char, prevChar, inblock)
      prevChar = char
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
      char = codePointAt(string, i)
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ')
          previousLineBreak = i
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE
      }
      plain = plain && isPlainSafe(char, prevChar, inblock)
      prevChar = char
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '))
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    if (plain && !forceQuotes && !testAmbiguousType(string)) {
      return STYLE_PLAIN
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE
}

// Renders `string` in the given numeric style at `level`.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function renderScalarStyle (state: PresentState, string: string, style: number, level: number) {
  const indent = state.indent * Math.max(1, level) // no 0-indent scalars
  // Block indentation indicator the reader applies relative to the parent
  // node's indentation n (content indent = n + indicator). At the document
  // root n is -1, so the indicator must be one greater than the spaces we
  // actually prepend; nested nodes have n >= 0 where state.indent matches.
  const blockIndent = level === 0 ? state.indent + 1 : state.indent
  // As indentation gets deeper, let the width decrease monotonically
  // to the lower bound min(state.lineWidth, 40).
  const lineWidth = (state.lineWidth === -1)
    ? -1
    : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent)

  switch (style) {
    case STYLE_PLAIN:
      return string
    case STYLE_SINGLE:
      return `'${string.replace(/'/g, "''")}'`
    case STYLE_LITERAL:
      return '|' + blockHeader(string, blockIndent) +
        dropEndingNewline(indentString(string, indent))
    case STYLE_FOLDED:
      return '>' + blockHeader(string, blockIndent) +
        dropEndingNewline(indentString(foldString(string, lineWidth), indent))
    case STYLE_DOUBLE:
      return `"${escapeString(string)}"`
    default:
      throw new YAMLException('impossible error: invalid scalar style')
  }
}

const SCALAR_STYLE_TO_NUM: Record<ScalarStyle, number> = {
  plain: STYLE_PLAIN,
  single: STYLE_SINGLE,
  double: STYLE_DOUBLE,
  literal: STYLE_LITERAL,
  folded: STYLE_FOLDED
}

// Chooses a style for `string` and renders it (node left `style` unset).
function writeScalar (state: PresentState, string: string, level: number, iskey: boolean, inblock: boolean) {
  if (string.length === 0) {
    return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''"
  }
  if (!state.noCompatMode) {
    if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string)) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? `"${string}"` : `'${string}'`
    }
  }

  const indent = state.indent * Math.max(1, level)
  const blockIndent = level === 0 ? state.indent + 1 : state.indent
  const lineWidth = (state.lineWidth === -1)
    ? -1
    : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent)

  // Without knowing if keys are implicit/explicit, assume implicit for safety.
  const singleLineOnly = iskey ||
    // No block styles in flow mode.
    (state.flowLevel > -1 && level >= state.flowLevel)
  function testAmbiguity (string: string) {
    return testImplicitResolving(state, string)
  }

  const style = chooseScalarStyle(string, singleLineOnly, blockIndent, lineWidth,
    testAmbiguity, state.quotingType, state.forceQuotes && !iskey, inblock)

  return renderScalarStyle(state, string, style, level)
}

function writeScalarNode (state: PresentState, node: ScalarNode, level: number, iskey: boolean, inblock: boolean) {
  if (node.style === undefined) {
    return writeScalar(state, node.value, level, iskey, inblock)
  }
  return renderScalarStyle(state, node.value, SCALAR_STYLE_TO_NUM[node.style], level)
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader (string: string, indentPerLevel: number) {
  const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : ''

  // note the special case: the string '\n' counts as a "trailing" empty line.
  const clip = string[string.length - 1] === '\n'
  const keep = clip && (string[string.length - 2] === '\n' || string === '\n')
  const chomp = keep ? '+' : (clip ? '' : '-')

  return `${indentIndicator}${chomp}\n`
}

// (See the note for renderScalarStyle.)
function dropEndingNewline (string: string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString (string: string, width: number) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  const lineRe = /(\n+)([^\n]*)/g

  // first line (possibly an empty line)
  let result = (() => {
    let nextLF = string.indexOf('\n')
    nextLF = nextLF !== -1 ? nextLF : string.length
    lineRe.lastIndex = nextLF
    return foldLine(string.slice(0, nextLF), width)
  })()
  // If we haven't reached the first content line yet, don't add an extra \n.
  let prevMoreIndented = string[0] === '\n' || string[0] === ' '
  let moreIndented

  // rest of the lines
  let match
  while ((match = lineRe.exec(string))) {
    const prefix = match[1]
    const line = match[2]

    moreIndented = (line[0] === ' ')
    result += prefix +
      ((!prevMoreIndented && !moreIndented && line !== '') ? '\n' : '') +
      foldLine(line, width)
    prevMoreIndented = moreIndented
  }

  return result
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine (line: string, width: number) {
  if (line === '' || line[0] === ' ') return line

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  const breakRe = / [^ ]/g // note: the match index will always be <= length-2.
  let match
  // start is an inclusive index. end, curr, and next are exclusive.
  let start = 0
  let end
  let curr = 0
  let next = 0
  let result = ''

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next // derive end <= length-2
      result += `\n${line.slice(start, end)}`
      // skip the space that was output as \n
      start = end + 1                    // derive start <= length-1
    }
    curr = next
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n'
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`
  } else {
    result += line.slice(start)
  }

  return result.slice(1) // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString (string: string) {
  let result = ''
  let char = 0

  for (let i = 0; i < string.length; char >= 0x10000 ? i += 2 : i++) {
    char = codePointAt(string, i)
    const escapeSeq = ESCAPE_SEQUENCES[char]

    if (!escapeSeq && isPrintable(char)) {
      result += string[i]
      if (char >= 0x10000) result += string[i + 1]
    } else {
      result += escapeSeq || encodeHex(char)
    }
  }

  return result
}

function hasExplicitTag (node: Node) {
  return node.kind !== 'alias' && node.tag !== IMPLICIT && node.tag !== ''
}

function writeFlowSequence (state: PresentState, level: number, node: SequenceNode) {
  let _result = ''

  for (let index = 0, length = node.items.length; index < length; index += 1) {
    const item = writeNode(state, level, node.items[index], false, false, false, false)
    if (_result !== '') _result += `,${!state.condenseFlow ? ' ' : ''}`
    _result += item
  }

  return `[${_result}]`
}

function writeBlockSequence (state: PresentState, level: number, node: SequenceNode, compact: boolean) {
  let _result = ''

  for (let index = 0, length = node.items.length; index < length; index += 1) {
    const item = writeNode(state, level + 1, node.items[index], true, true, false, true)

    if (!compact || _result !== '') {
      _result += generateNextLine(state, level)
    }

    // No trailing space when the value renders empty (e.g. null → '').
    if (item === '' || CHAR_LINE_FEED === item.charCodeAt(0)) {
      _result += '-'
    } else {
      _result += '- '
    }

    _result += item
  }

  return _result || '[]' // Empty sequence if no valid values.
}

function writeFlowMapping (state: PresentState, level: number, node: MappingNode) {
  let _result = ''
  const items = sortMappingItems(state, node.items)

  for (const { key, value } of items) {
    let pairBuffer = ''
    if (_result !== '') pairBuffer += ', '

    if (state.condenseFlow) pairBuffer += '"'

    const keyText = writeNode(state, level, key, false, false, false, false)

    if (keyText.length > 1024) pairBuffer += '? '

    const valueText = writeNode(state, level, value, false, false, false, false)
    // No separating space when the value renders empty (e.g. null → '').
    const sep = state.condenseFlow || valueText === '' ? '' : ' '

    pairBuffer += `${keyText}${state.condenseFlow ? '"' : ''}:${sep}${valueText}`

    _result += pairBuffer
  }

  return `{${_result}}`
}

// A scalar key sorts by its text; the default sort and a custom comparator both
// see that, matching the original keys-array sort.
function sortKeyValue (key: Node): any {
  return key.kind === 'scalar' ? key.value : key
}

function sortMappingItems (state: PresentState, items: MappingNode['items']) {
  if (!state.sortKeys) return items

  const copy = items.slice()

  if (state.sortKeys === true) {
    copy.sort((a, b) => {
      const x = sortKeyValue(a.key)
      const y = sortKeyValue(b.key)
      return x < y ? -1 : x > y ? 1 : 0
    })
  } else if (typeof state.sortKeys === 'function') {
    const fn = state.sortKeys
    copy.sort((a, b) => fn(sortKeyValue(a.key), sortKeyValue(b.key)))
  } else {
    throw new YAMLException('sortKeys must be a boolean or a function')
  }

  return copy
}

function writeBlockMapping (state: PresentState, level: number, node: MappingNode, compact: boolean) {
  let _result = ''
  const items = sortMappingItems(state, node.items)

  for (let index = 0, length = items.length; index < length; index += 1) {
    let pairBuffer = ''

    if (!compact || _result !== '') {
      pairBuffer += generateNextLine(state, level)
    }

    const { key, value } = items[index]

    // Keys are written in flow context: a collection key (only reachable via a
    // real `Map`) then renders inline (`{x: 1}` / `[1, 2]`) instead of as a
    // multi-line block that can't sit on a `key:` line. Scalar keys are
    // unaffected by flow-vs-block.
    const keyText = writeNode(state, level + 1, key, false, true, true, false)

    const explicitPair = hasExplicitTag(key) || (keyText.length > 1024)

    if (explicitPair) {
      if (keyText && CHAR_LINE_FEED === keyText.charCodeAt(0)) {
        pairBuffer += '?'
      } else {
        pairBuffer += '? '
      }
    }

    pairBuffer += keyText

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level)
    }

    const valueText = writeNode(state, level + 1, value, true, explicitPair, false, false)

    // No trailing space when the value renders empty (e.g. null → '').
    if (valueText === '' || CHAR_LINE_FEED === valueText.charCodeAt(0)) {
      pairBuffer += ':'
    } else {
      pairBuffer += ': '
    }

    pairBuffer += valueText

    _result += pairBuffer
  }

  return _result || '{}' // Empty mapping if no valid pairs.
}

// Encodes an explicit tag name into its printable `!!foo` / `!foo` / `!<uri>`
// form.
function encodeTag (tag: string) {
  // Need to encode all characters except those allowed by the spec:
  //
  // [35] ns-dec-digit    ::=  [#x30-#x39] /* 0-9 */
  // [36] ns-hex-digit    ::=  ns-dec-digit
  //                         | [#x41-#x46] /* A-F */ | [#x61-#x66] /* a-f */
  // [37] ns-ascii-letter ::=  [#x41-#x5A] /* A-Z */ | [#x61-#x7A] /* a-z */
  // [38] ns-word-char    ::=  ns-dec-digit | ns-ascii-letter | “-”
  // [39] ns-uri-char     ::=  “%” ns-hex-digit ns-hex-digit | ns-word-char | “#”
  //                         | “;” | “/” | “?” | “:” | “@” | “&” | “=” | “+” | “$” | “,”
  //                         | “_” | “.” | “!” | “~” | “*” | “'” | “(” | “)” | “[” | “]”
  //
  // Also need to encode '!' because it has special meaning (end of tag prefix).
  //
  let tagStr = encodeURI(
    tag[0] === '!' ? tag.slice(1) : tag
  ).replace(/!/g, '%21')

  if (tag[0] === '!') {
    tagStr = `!${tagStr}`
  } else if (tagStr.slice(0, 18) === 'tag:yaml.org,2002:') {
    tagStr = `!!${tagStr.slice(18)}`
  } else {
    tagStr = `!<${tagStr}>`
  }

  return tagStr
}

function writeNode (state: PresentState, level: number, node: Node, block: boolean, compact: boolean, iskey: boolean, isblockseq: boolean): string {
  if (node.kind === 'alias') return `*${node.anchor}`

  const inblock = block

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level)
  }

  const explicitTag = hasExplicitTag(node)
  const hasAnchor = node.anchor !== undefined

  if (explicitTag || hasAnchor || (state.indent !== 2 && level > 0)) {
    compact = false
  }

  let body: string

  if (node.kind === 'mapping') {
    const useBlock = block && node.items.length !== 0
    if (useBlock) {
      body = writeBlockMapping(state, level, node, compact)
    } else {
      body = writeFlowMapping(state, level, node)
    }
    if (hasAnchor) {
      body = useBlock ? `&${node.anchor}${body}` : `&${node.anchor} ${body}`
    }
  } else if (node.kind === 'sequence') {
    const useBlock = block && node.items.length !== 0
    if (useBlock) {
      if (state.noArrayIndent && !isblockseq && level > 0) {
        body = writeBlockSequence(state, level - 1, node, compact)
      } else {
        body = writeBlockSequence(state, level, node, compact)
      }
    } else {
      body = writeFlowSequence(state, level, node)
    }
    if (hasAnchor) {
      body = useBlock ? `&${node.anchor}${body}` : `&${node.anchor} ${body}`
    }
  } else {
    body = writeScalarNode(state, node, level, iskey, inblock)
  }

  if (explicitTag) {
    body = `${encodeTag(node.tag)} ${body}`
  }

  return body
}

// AST → text (no trailing newline).
function present (node: Node, options: PresentOptions): string {
  const state = createPresentState(options)
  return writeNode(state, 0, node, true, true, false, false)
}

export {
  present,
  type PresentOptions
}
