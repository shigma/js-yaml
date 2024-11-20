'use strict';

var { withMeta } = require('./util');

module.exports = withMeta({
  'Block style': withMeta({
    Clark: 'Evans',
    Brian: 'Ingerson',
    Oren: 'Ben-Kiki'
  }, {
    Clark: { line: 2, column: 10, position: 66 },
    Brian: { line: 3, column: 10, position: 82 },
    Oren: { line: 4, column: 10, position: 101 }
  }),
  'Flow style': withMeta({
    Clark: 'Evans',
    Brian: 'Ingerson',
    Oren: 'Ben-Kiki'
  }),
  'foo,bar': 'baz'
}, {
  'Block style': { line: 1, column: 13, position: 50 },
  'Flow style': { line: 5, column: 12, position: 122 },
  'foo,bar': { line: 10, column: 2, position: 259 }
});
