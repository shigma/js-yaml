import assert from 'node:assert/strict'
import { CORE_SCHEMA, load, mergeTag } from 'js-yaml'

// Merge keys are not part of CORE_SCHEMA by default, but can be enabled
// explicitly when you need YAML's `<<` merge feature.

const source = `
defaults: &defaults
  adapter: postgres
  host: localhost

development:
  <<: *defaults
  database: app_development
`
assert.deepStrictEqual(load(source, { schema: CORE_SCHEMA.withTags(mergeTag) }), {
  defaults: {
    adapter: 'postgres',
    host: 'localhost'
  },
  development: {
    adapter: 'postgres',
    host: 'localhost',
    database: 'app_development'
  }
})
