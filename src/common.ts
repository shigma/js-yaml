function isNothing (subject: unknown) {
  return (typeof subject === 'undefined') || (subject === null)
}

function isObject (subject: unknown) {
  return (typeof subject === 'object') && (subject !== null)
}

function isNegativeZero (number: number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number)
}

export {
  isNothing,
  isObject,
  isNegativeZero
}
