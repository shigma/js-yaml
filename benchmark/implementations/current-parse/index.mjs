import { parseEvents, createParserState } from '../../../src/parser.ts'

export function run (data) {
  const state = createParserState(data)
  return parseEvents(state)
}
