'use strict'

const { describe } = require('node:test')

const path = require('path')
const fs = require('fs')

describe('Issues', function () {
  const issues = path.resolve(__dirname, 'issues')

  fs.readdirSync(issues).forEach(function (file) {
    if (path.extname(file) === '.js') {
      require(path.resolve(issues, file))
    }
  })
})
