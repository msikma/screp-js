// screp-js <https://github.com/msikma/screp-js>
// © Apache 2.0 license

const {isPlainObject, isArray} = require('./data')

/**
 * Iterates over object nodes and processes them according to a given function.
 * 
 * All nodes that get transformed into 'undefined' are removed.
 */
function walkObjectNodes(process, nodeNames = []) {
  const next = obj => {
    if (isPlainObject(obj)) {
      const processed = Object.entries(obj).flatMap(([key, value]) => {
        if (nodeNames.includes(key)) {
          return process(key, value, next)
        }
        else {
          return [[key, next(value)]]
        }
      })
      return Object.fromEntries(processed.filter(item => item !== undefined))
    }
    else if (isArray(obj)) {
      return obj.map(value => next(value))
    }
    else {
      return obj
    }
  }
  return next
}

/**
 * Destructures the contents of nodes into their parent.
 */
function destructureObjectNodes(obj, nodeNames = []) {
  return walkObjectNodes(
    (_, value, next) => Object.entries(value).map(([key, value]) => [key, next(value)]),
    nodeNames
  )(obj)
}

/**
 * Removes specific nodes by key if their value is 0.
 */
function removeObjectNodesIfZero(obj, nodeNames = []) {
  return walkObjectNodes(
    (key, value) => [value === 0 ? undefined : [key, value]],
    nodeNames
  )(obj)
}

/**
 * Removes specific nodes by key.
 */
function removeObjectNodes(obj, nodeNames = []) {
  return walkObjectNodes(
    () => undefined,
    nodeNames
  )(obj)
}

/**
 * Sets empty array nodes to null.
 */
function setEmptyNodesToNull(obj, nodeNames = []) {
  return walkObjectNodes(
    (key, value) => [isArray(value) && value.length === 0 ? [key, null] : [key, value]],
    nodeNames
  )(obj)
}

/**
 * Converts numeric objects to arrays.
 */
function numericObjectToArray(obj, nodeNames = []) {
  return walkObjectNodes(
    (key, value, next) => [[key, [...value.map(arrValue => next(arrValue))]]],
    nodeNames
  )(obj)
}

/**
 * This modifies the result returned by screp-js to have the exact same format
 * as the screp command-line utility.
 *
 * The result object returned by screp-js has a number of small differences,
 * which would normally be resolved by passing the content through encode/json.
 * We don't do this JSON encoding step because it's very slow. Instead,
 * this function manually resolves all differences in the format.
 * 
 * Note: 'options._rawData', 'doTransform' and 'doRoundtrip' are undocumented.
 */
function transformResult(inputObj, {_rawData = false} = {}, doTransform = true, doRoundtrip = true) {
  // Debugging: return the object verbatim if we're skipping the transform step.
  if (!doTransform) {
    return inputObj
  }
  
  let obj = inputObj
  
  obj = destructureObjectNodes(obj, ['Enum', 'Base'])
  obj.Commands = setEmptyNodesToNull(obj.Commands, ['ParseErrCmds'])
  obj.Commands.Cmds = numericObjectToArray(obj.Commands.Cmds, ['UnitTags'])
  obj.Commands.Cmds = removeObjectNodesIfZero(obj.Commands.Cmds, ['IneffKind'])
  obj.Computed = setEmptyNodesToNull(obj.Computed, ['ChatCmds'])
  obj.Computed.LeaveGameCmds = removeObjectNodesIfZero(obj.Computed.LeaveGameCmds, ['IneffKind'])
  obj.MapData = numericObjectToArray(obj.MapData, ['Tiles'])
  obj.MapData.StartLocations = destructureObjectNodes(obj.MapData.StartLocations, ['Point'])
  obj.MapData.MineralFields = destructureObjectNodes(obj.MapData.MineralFields, ['Point'])

  // These nodes should be removed, but can probably remain without causing incompatibilities.
  if (_rawData === false) {
    obj.Commands = removeObjectNodes(obj.Commands, ['Debug'])
    obj.Computed = removeObjectNodes(obj.Computed, ['PIDPlayerDescs'])
    obj.Header = removeObjectNodes(obj.Header, ['Debug', 'OrigPlayers', 'PIDPlayers', 'RawHost', 'RawMap', 'RawTitle', 'Slots'])
    obj.Header.Players = removeObjectNodes(obj.Header.Players, ['RawName'])
    obj.MapData = removeObjectNodes(obj.MapData, ['Debug'])
  }

  // Debugging: convert the object to JSON and back. We opt not to do this since it's unnecessary.
  if (doRoundtrip) {
    obj = JSON.parse(JSON.stringify(obj))
  }

  return obj
}

/**
 * Transforms a list of version entries into an object.
 */
function versionToObject(versionEntries = []) {
  const transforms = {
    'screp version': 'screpVersion',
    'Parser version': 'parserVersion',
    'EAPM algorithm version': 'eapmVersion',
    'Platform': null,
    'Built with': 'goVersion',
    'Author': null,
    'Home page': null
  }
  const flat = versionEntries
    .map(([key, value]) => [transforms[key], value])
    .filter(([key]) => key != null)
  return Object.fromEntries(flat)
}

module.exports = {
  transformResult,
  versionToObject,
  destructureObjectNodes
}
