import { parseEvents, createParserState } from '../../../src/parser/parser.ts'

export function run (data) {
  const state = createParserState(data)
  return parseEvents(state)
}
