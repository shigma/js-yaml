These issue tests look redundant - yaml-test-suite already exercises the same
load/parse behavior, and removing each one loses no `dist/js-yaml.mjs` coverage.

Candidates for removal:

| Issue | Covered by spec | Behavior |
|-------|-----------------|----------|
| `0008` | `74H7`, `35KP` | tag on scalar / implicit-mapping key |
| `0017` | `S4JQ` | non-specific `!` tag resolves to string |
| `0026` | `96L6`, `HMK4` | folded scalar: line breaks → spaces |
| `0033` | `62EZ`, `ZCZ6` | content after flow collection / inline mapping |
| `0054` | `FQ7F`, `K4SU` | sequence of unicode plain scalars |
| `0062` | `74H7`, `35KP` | `!!str` tag on mapping key |
| `0063` | `PRH3`, `NP9H` | quoted scalars folded across lines |
| `0064` | `J3BT` | tab character inside scalar value (+ `0064.yml`) |
| `0092` | `26DV`, `LQZ7` | whitespace around `:` for quoted key |
| `0093` | `6VJK` | folded more-indented lines keep breaks |
| `0095` | `K858`, `A6F9` | empty block scalars + chomping modes |
| `0108` | `M29M`, `A6F9` | literal block scalar |
| `0154` | `NAT4`, `VJP3` | blank lines in quoted / multiline flow |
| `0155` | `FH7J` | `!!null` resolves to null |
| `0203` | `DWX9` | literal with leading empty lines |
| `0301` | `6KGN`, `PW8X` | anchor on empty node + alias |
| `0307` | `NP9H`, `PRH3`, `DE56` | double-quoted line folding |
| `0321` | `CTN5`, `9MAG` | double comma = empty node in flow |
| `0350` | `JHB9` | two-document stream |
| `0280` | `W4TN`, `M7A3`, `DWX9` | already `it.skip`; documents the conflict |
