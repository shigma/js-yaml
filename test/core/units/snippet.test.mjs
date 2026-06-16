import { it } from 'node:test'

import assert from 'node:assert'
import snippet from '../../../src/snippet.ts'

// Each case is [input, expected]. The `*` in `input` marks the cursor position
// the snippet should point at; it stays in the buffer, the column is taken from it.
const cases = [
  [
`*The first line.
The last line.
`,
` 1 | *The first line.
-----^
 2 | The last line.`
  ],
  [
`The first*line.
The last line.
`,
` 1 | The first*line.
--------------^
 2 | The last line.`
  ],
  [
`The first line.*
The last line.
`,
` 1 | The first line.*
--------------------^
 2 | The last line.`
  ],
  [
`The first line.
*The last line.
`,
` 1 | The first line.
 2 | *The last line.
-----^`
  ],
  [
`The first line.
The last*line.
`,
` 1 | The first line.
 2 | The last*line.
-------------^`
  ],
  [
`The first line.
The last line.*
`,
` 1 | The first line.
 2 | The last line.*
-------------------^`
  ],
  [
`The first line.
*The selected line.
The last line.
`,
` 1 | The first line.
 2 | *The selected line.
-----^
 3 | The last line.`
  ],
  [
`The first line.
The selected*line.
The last line.
`,
` 1 | The first line.
 2 | The selected*line.
-----------------^
 3 | The last line.`
  ],
  [
`The first line.
The selected line.*
The last line.
`,
` 1 | The first line.
 2 | The selected line.*
-----------------------^
 3 | The last line.`
  ],
  [
`*The only line.
`,
` 1 | *The only line.
-----^`
  ],
  [
`The only*line.
`,
` 1 | The only*line.
-------------^`
  ],
  [
`The only line.*
`,
` 1 | The only line.*
-------------------^`
  ],
  [
`Loooooooooooooooooooooooooooooooooooooooooooooong*Liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine
`,
` 1 |  ... oooooooooooooooooooooooooooong*Liiiiiiiiiiiiiiiiiiiiiiiiiiiii ...
----------------------------------------^`
  ],
  [
`1111111111111111111111111111111111111111111111122 22333333333333333333333333333333333333333333333333
Loooooooooooooooooooooooooooooooooooooooooooooong*Liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine
3333333333333333333333333333333333333333333333344 44555555555555555555555555555555555555555555555555
`,
` 1 |  ... 111111111111111111111111111122 223333333333333333333333333333 ...
 2 |  ... oooooooooooooooooooooooooooong*Liiiiiiiiiiiiiiiiiiiiiiiiiiiii ...
----------------------------------------^
 3 |  ... 333333333333333333333333333344 445555555555555555555555555555 ...`
  ],
  [
`11111111
Looooooooooooooooooooooooooooooooong*Liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine
33333333
`,
` 1 |  ... 11
 2 |  ... oooooooooooooooooooooooooooong*Liiiiiiiiiiiiiiiiiiiiiiiiiiiii ...
----------------------------------------^
 3 |  ... 33`
  ],
  [
`Looooooooooooooooooooooooooooooooong Liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine
*11111111
Looooooooooooooooooooooooooooooooong Liiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiine
`,
` 1 | Loooooooooooooooooooooooooooooo ...
 2 | *11111111
-----^
 3 | Loooooooooooooooooooooooooooooo ...`
  ],
  [
`1
2
3
4
5
6
7
8
*9
`,
` 6 | 6
 7 | 7
 8 | 8
 9 | *9
-----^`
  ],
  [
`1
2
3
4
5
6
7
8
*9
10
`,
`  6 | 6
  7 | 7
  8 | 8
  9 | *9
------^
 10 | 10`
  ]
]

it('Snippet', () => {
  for (const [input, expected] of cases) {
    assert(input.indexOf('*') >= 0)

    let index = 0
    let line = 0
    let column = 0

    while (input[index] !== '*') {
      if (input[index] === '\n') {
        line += 1
        column = 0
      } else {
        column += 1
      }
      index += 1
    }

    const mark = { name: 'snippet', buffer: input, position: index, line, column }

    const code = snippet(mark, { indent: 1, maxLength: 78, linesBefore: 3, linesAfter: 2 })

    assert.strictEqual(code, expected)
  }
})
