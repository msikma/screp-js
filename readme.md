[![Apache 2.0 license](https://img.shields.io/badge/license-Apache--2.0-green)](https://www.apache.org/licenses/LICENSE-2.0) [![npm version](https://badge.fury.io/js/screp-js.svg)](https://badge.fury.io/js/screp-js)

# screp-js-wrapper

A pure Javascript version of [screp](https://github.com/icza/screp), a StarCraft: Remastered replay file parser, compiled from the original Go version using [GopherJS](https://github.com/gopherjs/gopherjs).

screp (StarCraft: Brood War Replay Parser) is a library for extracting information from StarCraft replay files. This simple wrapper library allows GopherJS, a compiler from Go to Javascript, to make it available for use in Node.

This wrapper is usable both as a CommonJS module and as a browser global.

## Installation

This library has been pre-compiled and can be installed through npm:

```
npm i --save screp-js-wrapper
```

Keep in mind that the compiled screp library in JS is about 367 KB gzipped (and 1,3 MB otherwise).

## Usage

The screp library can be either included in an HTML page, in which case it will be added to the global namespace as `ScrepJS`, or it can be imported as a CommonJS module:

```js
const Screp = require('screp-js-wrapper')

const processRep(uint8arr) {
  try {
    // 'uint8arr' is a Uint8Array containing a .rep file.
    const res = await Screp.parseBuffer(uint8arr)
    return res
  }
  catch (err) {
    // If something went wrong, 'err' will be an Error object containing a string thrown by Go.
    console.log(err)
  }
}
```

### Reference

**Function:**

```js
Screp.parseBuffer(uint8arr[, {options}])
```

**Parameters:**

* `uint8arr` **Uint8Array**\
  the command to parse
* `options` **object** (optional)\
  a set of options used to change parsing behavior:
  * `header` **boolean**: *true*\
    include replay header
  * `computed` **boolean**: *true*\
    print computed/derived data
  * `mapData` **boolean**: *false*\
    include map data
  * `mapTiles` **boolean**: *false*\
    include map tiles; valid with `mapData`
  * `mapResLoc` **boolean**: *false*\
    print map data resource locations (minerals and geysers); valid with `mapData`
  * `cmds` **boolean**: *false*\
    print player commands

**Returns:**

* Promise (**object**): the same data as you'd get from the screp command line tool

The defaults are the same as those for the screp command line tool.

----

**Function:**

```js
Screp.getVersion()
```

**Returns:**

* **string**: the same version information as you'd get from `screp -version`

----

**Function:**

```js
Screp.getVersionObject()
```

**Returns:**

* **object**: version information in object form, with only the pertinent information visible

## Copyright

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), as per the original [screp](https://github.com/icza/screp) project.
