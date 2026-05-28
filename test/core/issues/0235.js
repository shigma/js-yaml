'use strict';

const { it } = require('node:test');

var assert = require('assert');
var yaml = require('js-yaml');

it('Flow style does not dump with block literals.', function () {
  assert.strictEqual(yaml.dump({ a: '\n' }, { flowLevel: 0 }), '{a: "\\n"}\n');
});

it('Ok to dump block-style literals when not yet flowing.', function () {
  // cf. example 8.6 from the YAML 1.2 spec
  assert.strictEqual(yaml.dump({ a: '\n' }, { flowLevel: 2 }), 'a: |+\n\n');
});
