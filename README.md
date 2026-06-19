JS-YAML - YAML 1.2 parser / writer for JavaScript
=================================================

[![CI](https://github.com/nodeca/js-yaml/actions/workflows/ci.yml/badge.svg)](https://github.com/nodeca/js-yaml/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/js-yaml.svg)](https://www.npmjs.org/package/js-yaml)

__[Online Demo](https://nodeca.github.io/js-yaml/)__


This is an implementation of [YAML](https://yaml.org/), a human-friendly data
serialization language. Started as [PyYAML](https://pyyaml.org/) port, it was
completely rewritten from scratch. Now it's very fast, and supports 1.2 spec.


Installation
------------

```
npm install js-yaml
```


API
---

Here we cover the most 'useful' methods. If you need advanced details (creating
your own tags), see [examples](https://github.com/nodeca/js-yaml/tree/master/examples)
for more info.

``` javascript
import { load } from 'js-yaml'
import { readFileSync } from 'node:fs'

// Get document, or throw exception on error
try {
  const doc = load(readFileSync('example.yml', 'utf8'))
  console.log(doc)
} catch (e) {
  console.log(e)
}
```


### load (string [ , options ])

Parses `string` as single YAML document. Throws `YAMLException` on error.
This function **does not** understand multi-document and empty sources,
it throws exception on those.

options:

- `filename` _(default: null)_ - string to be used as a file path in
  error/warning messages.
- `schema` _(default: `CORE_SCHEMA`)_ - specifies a schema to use.
  - `FAILSAFE_SCHEMA` - only strings, arrays and plain objects:
  - `JSON_SCHEMA` - all JSON-supported types:
  - `CORE_SCHEMA` - superset of `JSON_SCHEMA`, accepting more notations for the
    same types
  - `YAML11_SCHEMA` - adds the legacy YAML 1.1 types (`!!binary`, `!!timestamp`,
    `!!omap`, `!!pairs`, `!!set`, merge keys `<<`, and the broader 1.1 scalar
    notations).
- `json` _(default: false)_ - compatibility with JSON.parse behaviour. If true,
  then duplicate keys in a mapping will override values rather than throwing an
  error.
- `maxDepth` _(default: 100)_ - limits nesting depth for collections (does not
  take aliasees into account).
- `maxMergeSeqLength` _(default: 20)_ - limits the number of items in merge
  (`<<`) sequences.

NOTE: The default `CORE_SCHEMA` goes without `!!merge` tag. You can easily
enable it if needed:

``` javascript
import { load, CORE_SCHEMA, mergeTag } from 'js-yaml'

load(data, { schema: CORE_SCHEMA.withTags(mergeTag) })
```


### loadAll (string [, options ])

Same as `load()`, but understands multi-document sources. Returns an array of
documents.

``` javascript
import { loadAll } from 'js-yaml'

console.log(loadAll(data))
```


### dump (object [ , options ])

Serializes `object` as a YAML document. By default it can dump every supported
YAML type, so it will throw an exception if you try to dump regexps or
functions. However, you can disable exceptions by setting the `skipInvalid`
option to `true`.

options:

- `indent` _(default: 2)_ - indentation width to use (in spaces).
- `flowLevel` _(default: -1)_ - nesting level at which collections switch from
  block to flow style (`-1` means never).
- `seqNoIndent` _(default: false)_ - when true, will not add an indentation level to array elements.
- `seqInlineFirst` _(default: true)_ - when true, allows a nested collection to start on the same line after `-`.
- `skipInvalid` _(default: false)_ - do not throw on invalid types (like function
  in the safe schema) and skip pairs and single values with such types.
- `schema` _(default: a `YAML11_SCHEMA`-based schema)_ specifies a schema to use.
- `sortKeys` _(default: `false`)_ - if `true`, sort keys when dumping YAML. If a
  function, use the function to sort the keys.
- `lineWidth` _(default: `80`)_ - set max line width. Set `-1` for unlimited width.
- `noRefs` _(default: `false`)_ - if `true`, don't convert duplicate objects into references
- `quoteStyle` _(`auto`, `single`, or `double`, default: `auto`)_ - preferred quote style when a scalar needs quotes.
- `flowBracketPadding` _(default: `false`)_ - add spaces inside flow collection brackets.
- `flowSkipCommaSpace` _(default: `false`)_ - omit the space after commas in flow collections.
- `flowSkipColonSpace` _(default: `false`)_ - omit the space after `:` in flow mappings.
- `quoteFlowKeys` _(default: `false`)_ - quote flow mapping keys.
- `tagBeforeAnchor` _(default: `false`)_ - print an explicit tag before an anchor.
- `transform` - a function `(documents: Document[]) => void` that can mutate the
  generated AST before it is rendered.

See [examples](examples) for advanced customization approaches.


Supported YAML types
--------------------

The list of standard YAML tags and corresponding JavaScript types. See also
[YAML tag discussion](https://pyyaml.org/wiki/YAMLTagDiscussion) and
[YAML types repository](https://yaml.org/type/).

```
!!null ''                   # null
!!bool 'true'               # bool
!!int '3...'                # number
!!float '3.14...'           # number
!!str '...'                 # string
!!seq [ ... ]               # array
!!map { ... }               # object (or Map)
```

The types below are only available in `YAML11_SCHEMA` (not in the default
`CORE_SCHEMA`):

```
!!binary '...base64...'     # Uint8Array
!!timestamp 'YYYY-...'      # date
!!omap [ ... ]              # array of key-value pairs
!!pairs [ ... ]             # array or array pairs
!!set { ... }               # Set
```

**JavaScript-specific tags**

See [js-yaml-js-types](https://github.com/nodeca/js-yaml-js-types) for
extra types.


Caveats
-------

By default, `!!map` is loaded as a plain JavaScript object. Scalar keys that are
not strings, such as `null`, numbers or booleans, are converted to strings
because object property keys are strings. Complex keys, such as arrays or
objects, are rejected.

``` yaml
---
? null
: empty
? 1
: number
? true
: boolean
```

``` javascript
{ "null": "empty", "1": "number", "true": "boolean" }
```


CLI
---

This can be useful sometimes for quick-check.

```
npx js-yaml -h
```

Note, CLI script goes with minimalistic options and without big plans to extend.
