function isPlainObject (data: unknown): boolean {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return false
  const prototype = Object.getPrototypeOf(data)
  return prototype === null || prototype === Object.prototype
}

export {
  isPlainObject
}
