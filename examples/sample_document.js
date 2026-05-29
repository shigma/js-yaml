'use strict'

const fs = require('fs')
const path = require('path')
const util = require('util')
const yaml = require('../')

try {
  const filename = path.join(__dirname, 'sample_document.yml')
  const contents = fs.readFileSync(filename, 'utf8')
  const data = yaml.load(contents)

  console.log(util.inspect(data, false, 10, true))
} catch (err) {
  console.log(err.stack || String(err))
}
