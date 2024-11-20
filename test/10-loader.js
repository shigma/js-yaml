'use strict';


var assert = require('assert');
var path   = require('path');
var fs     = require('fs');
var yaml   = require('../');

var TEST_SCHEMA = require('./support/schema').TEST_SCHEMA;


describe('Loader', function () {
  var samplesDir = path.resolve(__dirname, 'samples-common');

  fs.readdirSync(samplesDir).forEach(function (jsFile) {
    if (path.extname(jsFile) !== '.js') return; // continue

    var yamlFile = path.resolve(samplesDir, path.basename(jsFile, '.js') + '.yml');

    it(path.basename(jsFile, '.js'), function () {
      var expected = require(path.resolve(samplesDir, jsFile));
      var actual   = [];

      yaml.loadAll(fs.readFileSync(yamlFile, { encoding: 'utf8' }), function (doc) { actual.push(doc); }, {
        filename: yamlFile,
        schema: TEST_SCHEMA
      });

      if (actual.length === 1) actual = actual[0];

      if (typeof expected === 'function') {
        expected.call(this, actual);
      } else {
        assert.deepStrictEqual(actual, expected);
      }
    });
  });
});

function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;
  if (!a || !b) return false;

  if (a[Symbol.for('yaml.meta')] && !deepEqual(a[Symbol.for('yaml.meta')], b[Symbol.for('yaml.meta')])) {
    // eslint-disable-next-line no-console
    console.log(a[Symbol.for('yaml.meta')]);
    // eslint-disable-next-line no-console
    console.log(b[Symbol.for('yaml.meta')]);
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  return Object.keys({ ...a, ...b }).every(key => deepEqual(a[key], b[key]));
}

describe('Loader with meta', function () {
  var samplesDir = path.resolve(__dirname, 'samples-meta');

  fs.readdirSync(samplesDir).forEach(function (yamlFile) {
    if (path.extname(yamlFile) !== '.yml') return; // continue

    yamlFile = path.resolve(samplesDir, yamlFile);
    var jsFile = path.resolve(samplesDir, path.basename(yamlFile, '.yml') + '.js');

    it(path.basename(yamlFile, '.yml'), function () {
      var expected = require(path.resolve(samplesDir, jsFile));

      var actual = yaml.load(fs.readFileSync(yamlFile, { encoding: 'utf8' }), {
        filename: yamlFile,
        schema: TEST_SCHEMA
      });

      assert(deepEqual(actual, expected));
    });
  });
});
