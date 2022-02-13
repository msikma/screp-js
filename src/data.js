// screp-js-wrapper <https://github.com/msikma/screp-js-wrapper>
// © Apache 2.0 license

/** Checks whether something is an array. */
const isArray = Array.isArray

/** Returns true for objects (such as {} or new Object()), false otherwise. */
const isPlainObject = obj => obj != null && typeof obj === 'object' && obj.constructor === Object

module.exports = {
  isArray,
  isPlainObject
}
