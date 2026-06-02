export interface SnippetMark {
  name?: string | null
  buffer: string
  position: number
  line: number
  column: number
  snippet?: string | null
}

interface SnippetOptions {
  maxLength?: number
  indent?: number
  linesBefore?: number
  linesAfter?: number
}

const DEFAULT_SNIPPET_OPTIONS: Required<SnippetOptions> = {
  maxLength: 79,
  indent: 1,
  linesBefore: 3,
  linesAfter: 2
}

// get snippet for a single line, respecting maxLength
function getLine (buffer: string, lineStart: number, lineEnd: number, position: number, maxLineLength: number) {
  let head = ''
  let tail = ''
  const maxHalfLength = Math.floor(maxLineLength / 2) - 1

  if (position - lineStart > maxHalfLength) {
    head = ' ... '
    lineStart = position - maxHalfLength + head.length
  }

  if (lineEnd - position > maxHalfLength) {
    tail = ' ...'
    lineEnd = position + maxHalfLength - tail.length
  }

  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
    pos: position - lineStart + head.length // relative position
  }
}

function padStart (string: string, max: number) {
  // max() protects from negativa value, to avoid exception.
  return ' '.repeat(Math.max(max - string.length, 0)) + string
}

function makeSnippet (mark: SnippetMark, options?: SnippetOptions) {
  if (!mark.buffer) return null

  const opts = { ...DEFAULT_SNIPPET_OPTIONS, ...options }

  const re = /\r?\n|\r|\0/g
  const lineStarts = [0]
  const lineEnds: number[] = []
  let match: RegExpExecArray | null
  let foundLineNo = -1

  while ((match = re.exec(mark.buffer))) {
    lineEnds.push(match.index)
    lineStarts.push(match.index + match[0].length)

    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2
    }
  }

  if (foundLineNo < 0) foundLineNo = lineStarts.length - 1

  let result = ''
  const lineNoLength = Math.min(mark.line + opts.linesAfter, lineEnds.length).toString().length
  const maxLineLength = opts.maxLength - (opts.indent + lineNoLength + 3)

  for (let i = 1; i <= opts.linesBefore; i++) {
    if (foundLineNo - i < 0) break
    const line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    )
    result = `${' '.repeat(opts.indent)}${padStart((mark.line - i + 1).toString(), lineNoLength)} | ${line.str}\n${result}`
  }

  const line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength)
  result += `${' '.repeat(opts.indent)}${padStart((mark.line + 1).toString(), lineNoLength)} | ${line.str}\n`
  result += `${'-'.repeat(opts.indent + lineNoLength + 3 + line.pos)}^\n`

  for (let i = 1; i <= opts.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length) break
    const line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    )
    result += `${' '.repeat(opts.indent)}${padStart((mark.line + i + 1).toString(), lineNoLength)} | ${line.str}\n`
  }

  return result.replace(/\n$/, '')
}

export default makeSnippet
