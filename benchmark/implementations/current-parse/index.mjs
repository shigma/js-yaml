import { parseEvents } from '../../../src/parser/parser.ts'

export function run (data) {
  return parseEvents(data, {})
}
