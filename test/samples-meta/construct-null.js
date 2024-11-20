'use strict';

var { withMeta } = require('./util');

module.exports = withMeta({
  empty: null,
  canonical: null,
  english: null,
  null: 'null key',
  sparse: withMeta([
    null,
    '2nd entry',
    null,
    '4th entry',
    null
  ], [
    { line: 9, column: 4, position: 160 },
    { line: 10, column: 4, position: 166 },
    { line: 11, column: 3, position: 179 },
    { line: 12, column: 4, position: 184 },
    { line: 13, column: 4, position: 198 }
  ])
}, {
  empty: { line: 2, column: 6, position: 55 },
  canonical: { line: 3, column: 11, position: 67 },
  english: { line: 4, column: 9, position: 78 },
  null: { line: 5, column: 3, position: 86 },
  sparse: { line: 8, column: 7, position: 155 }
});
