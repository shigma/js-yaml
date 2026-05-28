'use strict';


var assert = require('assert');
var yaml = require('js-yaml');


it('Parse failed when no document start present', function () {
  assert.doesNotThrow(function () {
    yaml.load(`
foo: !!str bar
`);
  }, TypeError);
});
