'use strict';

const { it } = require('node:test');

const assert = require('assert');
const yaml = require('js-yaml');


it('should error on invalid indentation in mappings', function () {
  assert.throws(() => yaml.load('foo: "1" bar: "2"'), /bad indentation of a mapping entry/);
  assert.throws(() => yaml.load('- "foo" - "bar"'),   /bad indentation of a sequence entry/);
});
