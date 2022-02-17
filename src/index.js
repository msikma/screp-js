// screp-js <https://github.com/msikma/screp-js>
// © Apache 2.0 license

const {ScrepJS} = require('screp-js')
const {transformResult, versionToObject} = require('./transform')
const {filterResult} = require('./filter')

/** Default settings for what values to include in the output. */
const optionDefaults = {
  header: true,
  computed: true,
  mapData: false,
  mapTiles: false,
  mapResLoc: false,
  cmds: false,
  rawData: false
}

function Screp() {
  /**
   * Wrapper for the ScrepJS.parseBuffer() function.
   * 
   * This runs ScrepJS asynchronously, throwing an error if something went wrong
   * (instead of returning it), and transforming the result to be exactly the same
   * as what you get from the screp command line tool.
   * 
   * A number of transformations need to be performed; see <transform.js>.
   */
  function parseBuffer(uint8array, userOptions = {}) {
    const options = {...optionDefaults, ...userOptions}
    return new Promise((resolve, reject) => {
      const [res, err] = ScrepJS.parseBuffer(uint8array)
      if (err) {
        return reject(new Error(err))
      }
      const obj = transformResult(res, options)
      return resolve(filterResult(obj, options))
    })
  }

  /**
   * Returns the same version information string that is also reported by the command line tool.
   */
  function getVersion() {
    return ScrepJS.getVersion().map(item => item.join(': ')).join('\n')
  }

  /**
   * Returns the version as an object with only pertinent version information.
   */
  function getVersionObject() {
    return versionToObject(ScrepJS.getVersion())
  }
  
  return {
    getVersion,
    getVersionObject,
    parseBuffer
  }
}

module.exports = Screp()
