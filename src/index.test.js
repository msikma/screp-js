// screp-js <https://github.com/msikma/screp-js>
// © Apache 2.0 license

const fs = require('fs').promises
const path = require('path')
const {promisify} = require('node:util')
const {unzip} = require('node:zlib')
const cloneDeep = require('lodash.clonedeep')
const Screp = require('./index')
const {filterResult} = require('./filter')

/** Promisified version of unzip(). */
const unzipP = promisify(unzip)

/** Test replay files by Light. */
const repFiles = [
  '3307 EverPJayP ErOsLightT.rep',
  '3308 ErOsLightT EverPJayP.rep',
  '3309 7000wonP ErOsLightT.rep'
]

/** Default settings for what values to include in the output. */
const optionDefaults = {
  header: true,
  computed: true,
  mapData: false,
  mapTiles: false,
  mapResLoc: false,
  cmds: false
}

/** Options for getting the complete output. */
const optionsFull = {
  mapData: true,
  mapTiles: true,
  mapResLoc: true,
  cmds: true
}

/**
 * Parses a replay file with screp and returns its data.
 */
const parseRepFile = async (file, options = optionsFull, transformOptions = {}) => {
  const filepath = path.resolve(path.join(__dirname, '..', 'test', `${file}.gz`))
  const data = await unzipP(await fs.readFile(filepath, {encoding: null}))
  const res = Screp.parseBuffer(data, options, transformOptions)

  return res
}

/**
 * Returns the parsed JSON data from a .rep.json file.
 */
const getRepJSON = async file => {
  const filepath = path.resolve(path.join(__dirname, '..', 'test', `${file}.json.gz`))
  const buffer = await unzipP(await fs.readFile(filepath, {encoding: null}))
  return JSON.parse(buffer)
}

describe(`screp-js package`, () => {
  describe(`Screp.parseBuffer()`, () => {
    it('correctly parses replay files', async () => {
      for (const repFile of repFiles) {
        const repData = JSON.parse(JSON.stringify(await parseRepFile(repFile)))
        const expectedData = await getRepJSON(repFile)
        expect(repData).toEqual(expectedData)
      }
    })
    it('only includes requested data', async () => {
      const repFile = repFiles[0]
      const rawRepData = await parseRepFile(repFile, {}, {_doFilter: false})

      const optionTests = [
        [{}, repData => {
          expect(repData.MapData).toBe(null)
          expect(repData.Commands).toBe(null)
        }],
        [{cmds: true}, repData => {
          expect(repData.MapData).toBe(null)
          expect(repData.Commands).not.toBe(null)
        }],
        [{header: false}, repData => {
          expect(repData.MapData).toBe(null)
          expect(repData.Header).toBe(null)
        }],
        [{computed: false}, repData => {
          expect(repData.MapData).toBe(null)
          expect(repData.Computed).toBe(null)
        }],
        [{mapData: true}, repData => {
          expect(repData.MapData).not.toBe(null)
          expect(repData.MapData.Tiles).toBe(null)
          expect(repData.MapData.MineralFields).toBe(null)
          expect(repData.MapData.Geysers).toBe(null)
          expect(Object.keys(repData.MapData)).toEqual(expect.arrayContaining(['PlayerOwners', 'PlayerSides']))
        }],
        [{mapData: true, mapTiles: true}, repData => {
          expect(repData.MapData).not.toBe(null)
          expect(repData.MapData.Tiles).not.toBe(null)
          expect(repData.MapData.MineralFields).toBe(null)
          expect(repData.MapData.Geysers).toBe(null)
        }],
        [{mapData: true, mapTiles: true, mapResLoc: true}, repData => {
          expect(repData.MapData).not.toBe(null)
          expect(repData.MapData.Tiles).not.toBe(null)
          expect(repData.MapData.MineralFields).not.toBe(null)
          expect(repData.MapData.Geysers).not.toBe(null)
        }],
        [{mapData: true, mapTiles: false, mapResLoc: true}, repData => {
          expect(repData.MapData).not.toBe(null)
          expect(repData.MapData.Tiles).toBe(null)
          expect(repData.MapData.MineralFields).not.toBe(null)
          expect(repData.MapData.Geysers).not.toBe(null)
          expect(Object.keys(repData.MapData.MineralFields[0])).toEqual(['X', 'Y', 'Amount'])
        }],
        [{mapData: false, mapTiles: true, mapResLoc: true}, repData => {
          expect(repData.MapData).toBe(null)
        }]
      ]

      for (const [options, runTest] of optionTests) {
        const resolvedOptions = Screp.resolveOptions(options)
        const repData = filterResult(cloneDeep(rawRepData), resolvedOptions)
        runTest(repData)
      }
    })
    it('includes JS-native data values', async () => {
      const repFile = repFiles[0]
      const repData = await parseRepFile(repFile, {})
      expect(repData.Header.StartTime.constructor.name).toBe('Date')
    })
  })
  describe(`Screp.resolveOptions()`, () => {
    it('defaults to the screp default options', () => {
      const res = Screp.resolveOptions({})
      expect(res).toStrictEqual({
        cmds: false,
        computed: true,
        header: true,
        mapData: false,
        mapResLoc: false,
        mapTiles: false
      })
    })
    it('discards unknown options', () => {
      expect(Screp.resolveOptions({something: true})).not.toHaveProperty('something')
      expect(Screp.resolveOptions({something: true})).toHaveProperty('computed')
      expect(Screp.resolveOptions({something: 32})).not.toHaveProperty('something')
      expect(Screp.resolveOptions({somethingElse: []})).not.toHaveProperty('somethingElse')
    })
    it(`allows '_rawData' if 'includeUndocumented' is true`, () => {
      expect(Screp.resolveOptions({_rawData: true}, true)).toHaveProperty('_rawData')
      expect(Screp.resolveOptions({something: true}, true)).not.toHaveProperty('something')
    })
  })
  describe(`Screp.getVersionObject()`, () => {
    it('returns a version object with the expected keys', () => {
      // Since version numbers will change, we only check to see if the expected keys are there.
      const versionObject = Screp.getVersionObject()
      const expectedKeys = [
        'screpVersion',
        'parserVersion',
        'eapmVersion',
        'goVersion'
      ]
      expect(Object.keys(versionObject)).toStrictEqual(expectedKeys)
    })
  })
})
