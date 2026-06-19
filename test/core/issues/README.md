These issue tests look redundant - yaml-test-suite already exercises the same
load/parse behavior, and removing each one loses no `dist/js-yaml.mjs` coverage.

Candidates for removal:

| Issue | Covered by spec | Behavior |
|-------|-----------------|----------|
| `0054` | `FQ7F`, `K4SU` | sequence of unicode plain scalars |
| `0063` | `PRH3`, `NP9H` | quoted scalars folded across lines |
