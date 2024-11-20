'use strict';

var { withMeta } = require('./util');

module.exports = withMeta({
  'Block style': withMeta([
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
  ], [
    { line: 2, column: 2, position: 49 },
    { line: 3, column: 2, position: 94 },
    { line: 4, column: 2, position: 132 },
    { line: 5, column: 2, position: 159 },
    { line: 6, column: 2, position: 186 },
    { line: 7, column: 2, position: 210 },
    { line: 8, column: 2, position: 232 },
    { line: 9, column: 2, position: 275 },
    { line: 10, column: 2, position: 307 }
  ]),
  'Flow style': withMeta([
    'Mercury',
    'Venus',
    'Earth',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto'
  ], [
    { line: 11, column: 20, position: 363 },
    { line: 11, column: 29, position: 372 },
    { line: 11, column: 36, position: 379 },
    { line: 11, column: 43, position: 386 },
    { line: 12, column: 20, position: 425 },
    { line: 12, column: 29, position: 434 },
    { line: 12, column: 37, position: 442 },
    { line: 12, column: 45, position: 450 },
    { line: 13, column: 20, position: 485 }
  ])
}, {
  'Block style': { line: 1, column: 13, position: 41 },
  'Flow style': { line: 11, column: 12, position: 355 }
});
