'use strict';

const { it } = require('node:test');

var assert = require('assert');

var isNegativeZero = require('../../../lib/common').isNegativeZero;


it('isNegativeZero', function () {
  assert(!isNegativeZero(0));
  assert(!isNegativeZero(0.0));
  assert(isNegativeZero(-0));
  assert(isNegativeZero(-0.0));
});
