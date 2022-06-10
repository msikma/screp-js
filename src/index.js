// screp-js <https://github.com/msikma/screp-js>
// © Apache 2.0 license

const {ScrepJS} = require('screp-js-wrapper')
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
  _rawData: false
}

/** Output transformation options: primarily for debugging. Undocumented and unsupported. */
const transformDefaults = {
  _doTransform: true,
  _doFilter: true,
  _doRoundtrip: false
}

function Screp() {
  /**
   * Merges user options with the defaults and discards invalid options.
   */
  function resolveOptions(userOptions, includeUndocumented = false) {
    const keys = Object.keys(optionDefaults)
    const validOptions = includeUndocumented ? keys : keys.filter(key => !key.startsWith('_'))
    const options = {...optionDefaults, ...userOptions}

    // Filter out all keys that do not belong.
    return Object.fromEntries(
      Object.entries(options)
        .map(([key, value]) => validOptions.includes(key) ? [key, value] : null)
        .filter(option => option)
    )
  }

  /**
   * Wrapper for the ScrepJS.parseBuffer() function.
   * 
   * This runs ScrepJS asynchronously, throwing an error if something went wrong
   * (instead of returning it), and transforming the result to be exactly the same
   * as what you get from the screp command line tool.
   * 
   * A number of transformations need to be performed; see <transform.js>.
   */
  function parseBuffer(uint8array, userOptions = {}, _transformOptions = {}) {
    const transformOptions = {...transformDefaults, ..._transformOptions}
    const options = resolveOptions(userOptions, true)

    return new Promise((resolve, reject) => {
      const [res, err] = ScrepJS.parseBuffer(uint8array)
      if (err) {
        return reject(new Error(err))
      }
      const obj = transformResult(res, options, transformOptions._doTransform, transformOptions._doRoundtrip)
      return resolve(filterResult(obj, options, transformOptions._doFilter))
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
    resolveOptions,
    parseBuffer
  }
}

module.exports = Screp()
