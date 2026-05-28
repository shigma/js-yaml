'use strict';

const { it } = require('node:test');

var assert = require('assert');
var yaml = require('js-yaml');


it('should convert new line into white space', function () {
  var data = yaml.load(`
test: >
  a
  b
  c
`);

  assert.strictEqual(data.test, 'a b c\n');
});
