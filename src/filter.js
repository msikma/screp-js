// screp-js-wrapper <https://github.com/msikma/screp-js-wrapper>
// © Apache 2.0 license

/**
 * Removes unwanted sections from the output.
 * 
 * This simply sets the sections to null. Processing speed is unaffected.
 */
function filterResult(inputObj, {header, computed, mapData, mapTiles, mapResLoc, cmds} = {}) {
  let obj = inputObj
  if (!header) {
    obj.Header = null
  }
  if (!computed) {
    obj.Commands = null
  }
  if (!mapData) {
    obj.MapData = null
  }
  else {
    if (!mapTiles) {
      obj.MapData.Tiles = null
    }
    if (!mapResLoc) {
      obj.MapData.MineralFields = null
      obj.MapData.Geysers = null
    }
  }
  if (!cmds) {
    obj.Commands = null
  }
  return obj
}

module.exports = {
  filterResult
}
