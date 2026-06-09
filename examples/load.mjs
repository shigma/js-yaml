import util from 'node:util'
import { load } from 'js-yaml'

const source = `
name: Wizard
level: 17
inventory:
  - name: Hat
    features: [magic, pointed]
  - name: Staff
    damage: 10
`

console.log(util.inspect(load(source), { depth: null }))
// {
//   name: 'Wizard',
//   level: 17,
//   inventory: [
//     { name: 'Hat', features: [ 'magic', 'pointed' ] },
//     { name: 'Staff', damage: 10 }
//   ]
// }
