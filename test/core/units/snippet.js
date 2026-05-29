'use strict'

const { it } = require('node:test')

var assert = require('assert')
var path = require('path')
var fs = require('fs')
var snippet = require('../../../lib/snippet')

it('Snippet', function () {
  let filepath = path.join(__dirname, 'snippet.txt')
  let filedata = fs.readFileSync(filepath, 'utf8')

  let data = filedata.split(/(---[ \d]*\n)/).slice(1)

  for (let i = 0; i < data.length; i += 4) {
    let index = 0
    let line = 0
    let column = 0
    let input = data[i + 1]
    let expected = data[i + 3].replace(/\n$/, '')
    let mark
    let code

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

    mark = {
      name: filepath,
      buffer: input,
      position: index,
      line: line,
      column: column
    }

    code = snippet(mark, {
      indent: 1,
      maxLength: 78,
      linesBefore: 3,
      linesAfter: 2
    })

    assert.strictEqual(code, expected)
  }
})
