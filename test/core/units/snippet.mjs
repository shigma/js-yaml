import { it } from 'node:test'

import assert from 'node:assert'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import snippet from '../../../lib/snippet.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

it('Snippet', function () {
  const filepath = path.join(__dirname, 'snippet.txt')
  const filedata = fs.readFileSync(filepath, 'utf8')

  const data = filedata.split(/(---[ \d]*\n)/).slice(1)

  for (let i = 0; i < data.length; i += 4) {
    let index = 0
    let line = 0
    let column = 0
    const input = data[i + 1]
    const expected = data[i + 3].replace(/\n$/, '')

    assert(input.indexOf('*') >= 0)

    while (input[index] !== '*') {
      if (input[index] === '\n') {
        line += 1
        column = 0
      } else {
        column += 1
      }
      index += 1
    }

    const mark = {
      name: filepath,
      buffer: input,
      position: index,
      line: line,
      column: column
    }

    const code = snippet(mark, {
      indent: 1,
      maxLength: 78,
      linesBefore: 3,
      linesAfter: 2
    })

    assert.strictEqual(code, expected)
  }
})
