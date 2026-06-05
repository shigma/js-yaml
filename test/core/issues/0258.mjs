import { it } from 'node:test'

import assert from 'node:assert'
import { CORE_SCHEMA, dump, load, defineScalarTag } from 'js-yaml'

it('should shorthand tags with !! whenever possible', () => {
  const regexp = defineScalarTag('tag:yaml.org,2002:js/regexp', {
    resolve: str => new RegExp(str),
    identify: object => object instanceof RegExp,
    represent: object => object.source
  })

  const schema = CORE_SCHEMA.withTags(regexp)

  const source = 're: !!js/regexp .*\n'

  const object = load(source, { schema })
  assert(object.re instanceof RegExp)

  const str = dump(object, { schema })
  assert.strictEqual(str, source)
})
