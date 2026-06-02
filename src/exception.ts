import type { SnippetMark } from './snippet.ts'

// YAML error class. http://stackoverflow.com/questions/8458984
//
function formatError (exception: YAMLException, compact?: boolean) {
  let where = ''
  const message = exception.reason || '(unknown reason)'

  if (!exception.mark) return message

  if (exception.mark.name) {
    where += `in "${exception.mark.name}" `
  }

  where += `(${exception.mark.line + 1}:${exception.mark.column + 1})`

  if (!compact && exception.mark.snippet) {
    where += `\n\n${exception.mark.snippet}`
  }

  return `${message} ${where}`
}

class YAMLException extends Error {
  reason: string
  mark?: SnippetMark

  constructor (reason: string, mark?: SnippetMark) {
    // Super constructor
    super()

    this.name = 'YAMLException'
    this.reason = reason
    this.mark = mark
    this.message = formatError(this, false)

    // Include stack trace in error object
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor)
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = (new Error()).stack || ''
    }
  }

  toString (compact?: boolean) {
    return `${this.name}: ${formatError(this, compact)}`
  }
}

export default YAMLException
