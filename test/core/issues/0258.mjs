import { it } from 'node:test'

import assert from 'node:assert'
import { DEFAULT_SCHEMA, dump, load, NODE_KIND_SCALAR, Type } from 'js-yaml'

it('should shorthand tags with !! whenever possible', () => {
  const regexp = new Type('tag:yaml.org,2002:js/regexp', {
    nodeKind: NODE_KIND_SCALAR,
    resolve: () => true,
    construct: str => new RegExp(str),
    predicate: object => object instanceof RegExp,
    represent: object => object.source
  })

  const schema = DEFAULT_SCHEMA.extend(regexp)

  const source = 're: !!js/regexp .*\n'

  const object = load(source, { schema })
  assert(object.re instanceof RegExp)

  const str = dump(object, { schema })
  assert.strictEqual(str, source)
})
