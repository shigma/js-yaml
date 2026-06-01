import { it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, dump, load, Type } from 'js-yaml'

it('should shorthand tags with !! whenever possible', function () {
  const regexp = new Type('tag:yaml.org,2002:js/regexp', {
    kind: 'scalar',
    resolve: () => true,
    construct: str => new RegExp(str),
    instanceOf: RegExp,
    represent: object => object.source
  })

  const schema = DEFAULT_SCHEMA.extend(regexp)

  const source = 're: !!js/regexp .*\n'

  const object = load(source, { schema })
  assert(object.re instanceof RegExp)

  const str = dump(object, { schema })
  assert.strictEqual(str, source)
})
