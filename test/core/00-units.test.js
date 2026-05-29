'use strict'

const { describe } = require('node:test')

const path = require('path')
const fs = require('fs')

describe('Units', function () {
  const directory = path.resolve(__dirname, 'units')

  fs.readdirSync(directory).forEach(function (file) {
    if (path.extname(file) === '.js') {
      require(path.resolve(directory, file))
    }
  })
})
