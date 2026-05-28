'use strict';

const { it } = require('node:test');

var assert = require('assert');
var yaml   = require('js-yaml');


it('Named null', function () {
  assert.deepStrictEqual(yaml.load('---\ntest: !!null \nfoo: bar'), { test: null, foo: 'bar' });
});
