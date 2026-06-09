import { dump } from 'js-yaml'

const character = {
  name: 'Wizard',
  level: 17,
  inventory: [
    { name: 'Hat', features: ['magic', 'pointed'] },
    { name: 'Staff', damage: 10 },
    { name: 'Cloak', defence: 0, comfort: 3 }
  ]
}

console.log(dump(character, {
  flowLevel: 3,
  sortKeys: true
}))
// inventory:
//   - features: [magic, pointed]
//     name: Hat
//   - damage: 10
//     name: Staff
//   - comfort: 3
//     defence: 0
//     name: Cloak
// level: 17
// name: Wizard
