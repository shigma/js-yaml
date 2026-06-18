function isPlainObject (data: unknown): boolean {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) return false
  const prototype = Object.getPrototypeOf(data)
  return prototype === null || prototype === Object.prototype
}

// Project `object` onto `keys`. Absent keys are skipped (so the result can be
// safely spread over defaults without clobbering them with `undefined`), hence
// the `Partial` return.
function pick<T extends object, K extends keyof T> (object: T, keys: readonly K[]): Partial<Pick<T, K>> {
  const result: Partial<Pick<T, K>> = {}
  for (const key of keys) {
    if (object[key] !== undefined) result[key] = object[key]
  }
  return result
}

export {
  isPlainObject,
  pick
}
