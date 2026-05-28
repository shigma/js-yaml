'use strict';


var assert = require('assert');
var yaml   = require('js-yaml');


it('Should not encode astral characters', function () {
  assert.strictEqual(yaml.dump('😃😊'), '😃😊\n');
});
