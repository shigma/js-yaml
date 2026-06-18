import type { SnippetMark } from './snippet.ts'

// YAML error class. http://stackoverflow.com/questions/8458984
//
function formatError (exception: YAMLException, compact?: boolean) {
  let where = ''

  if (!exception.mark) return exception.reason

  if (exception.mark.name) {
    where += `in "${exception.mark.name}" `
  }

  where += `(${exception.mark.line + 1}:${exception.mark.column + 1})`

  if (!compact && exception.mark.snippet) {
    where += `\n\n${exception.mark.snippet}`
  }

  return `${exception.reason} ${where}`
}

class YAMLException extends Error {
  reason: string
  mark?: SnippetMark

  constructor (reason: string, mark?: SnippetMark) {
    super()

    this.name = 'YAMLException'
    this.reason = reason
    this.mark = mark
    this.message = formatError(this, false)

    // Guard for ancient browsers
    if (Error.captureStackTrace) {
      // Include stack trace in error object,
      Error.captureStackTrace(this, this.constructor)
    }
  }

  toString (compact?: boolean) {
    return `${this.name}: ${formatError(this, compact)}`
  }
}

export { YAMLException }
