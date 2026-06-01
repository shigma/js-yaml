import { it } from 'node:test'

import assert from 'node:assert'
import { dump, load } from 'js-yaml'

it('Dumper should add quotes around equals sign', () => {
  // pyyaml fails with unquoted `=`
  // https://yaml-online-parser.appspot.com/?yaml=%3D%0A&type=json
  assert.strictEqual(load(dump('=')), '=')
  assert.strictEqual(dump('='), "'='\n")
})
