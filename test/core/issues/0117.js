'use strict';


var assert = require('assert');
var yaml   = require('js-yaml');


it('Negative zero loses the sign after dump', function () {
  assert.strictEqual(yaml.dump(-0), '-0.0\n');
});
