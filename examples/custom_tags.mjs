import util from 'node:util'
import {
  CORE_SCHEMA,
  defineMappingTag,
  defineSequenceTag,
  dump,
  load
} from 'js-yaml'

class Point {
  constructor (x = 0, y = 0, z = 0) {
    this.x = x
    this.y = y
    this.z = z
  }
}

class Space {
  constructor (height = 0, width = 0, points = []) {
    this.height = height
    this.width = width
    this.points = points
  }
}

const schema = CORE_SCHEMA.withTags(
  defineSequenceTag('!point', {
    create: () => new Point(),
    addItem: (point, value, index) => {
      if (index === 0) point.x = value
      else if (index === 1) point.y = value
      else if (index === 2) point.z = value
      else throw new Error('!point expects exactly 3 items')
    },
    identify: value => value instanceof Point,
    represent: point => [point.x, point.y, point.z]
  }),

  defineMappingTag('!space', {
    create: () => new Space(),
    addPair: (space, key, value) => {
      if (key === 'height') space.height = value
      else if (key === 'width') space.width = value
      else if (key === 'points') space.points = value
      return ''
    },
    has: () => false,
    keys: space => Object.keys(space),
    get: (space, key) => space[key],
    identify: value => value instanceof Space,
    represent: space => new Map([
      ['height', space.height],
      ['width', space.width],
      ['points', space.points]
    ])
  })
)

const source = `
spaces:
  - !space
    height: 1000
    width: 1000
    points:
      - !point [10, 43, 23]
      - !point [165, 0, 50]
  - !space
    height: 64
    width: 128
    points:
      - !point [12, 43, 0]
`

const loaded = load(source, { schema })

console.log(util.inspect(loaded, { depth: null }))
// {
//   spaces: [
//     Space {
//       height: 1000,
//       width: 1000,
//       points: [ Point { x: 10, y: 43, z: 23 }, Point { x: 165, y: 0, z: 50 } ]
//     },
//     Space {
//       height: 64,
//       width: 128,
//       points: [ Point { x: 12, y: 43, z: 0 } ]
//     }
//   ]
// }

console.log(dump(loaded, { schema, flowLevel: 3 }))
// spaces:
//   - !space
//     height: 1000
//     width: 1000
//     points: [!point [10, 43, 23], !point [165, 0, 50]]
//   - !space
//     height: 64
//     width: 128
//     points: [!point [12, 43, 0]]
