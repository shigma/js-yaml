'use strict';

const { it } = require('node:test');

var assert = require('assert');
var yaml   = require('js-yaml');


it('BOM strip', function () {
  assert.deepStrictEqual(yaml.load('\uFEFFfoo: bar\n'), { foo: 'bar' });
  assert.deepStrictEqual(yaml.load('foo: bar\n'), { foo: 'bar' });
});
