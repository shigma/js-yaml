'use strict'

const { it } = require('node:test')

const assert = require('assert')
const yaml = require('js-yaml')

it('should shorthand tags with !! whenever possible', function () {
  const regexp = new yaml.Type('tag:yaml.org,2002:js/regexp', {
    kind: 'scalar',
    resolve: () => true,
    construct: str => new RegExp(str),
    instanceOf: RegExp,
    represent: object => object.source
  })

  const schema = yaml.DEFAULT_SCHEMA.extend(regexp)

  const source = 're: !!js/regexp .*\n'

  const object = yaml.load(source, { schema })
  assert(object.re instanceof RegExp)

  const str = yaml.dump(object, { schema })
  assert.strictEqual(str, source)
})
