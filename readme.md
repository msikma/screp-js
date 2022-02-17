[![Apache 2.0 license](https://img.shields.io/badge/license-Apache--2.0-green)](https://www.apache.org/licenses/LICENSE-2.0) [![npm version](https://badge.fury.io/js/screp-js.svg)](https://badge.fury.io/js/screp-js)

# screp-js

A pure Javascript version of [screp](https://github.com/icza/screp), a StarCraft: Remastered replay file parser, compiled from the original Go version using [GopherJS](https://github.com/gopherjs/gopherjs).

screp (StarCraft: Brood War Replay Parser) is a library for extracting information from StarCraft replay files. This library uses a compiled version of the original library recompiled for Javascript. It's designed to parse file buffers of .rep files—if you want an easier interface aimed at parsing files through Node, try [screp-js-file](https://github.com/msikma/screp-js-file).

This wrapper is usable both as a CommonJS module and as a browser global.

## Installation

This library can be installed through npm:

```
npm i --save screp-js
```

This library is about 367 KB gzipped (and 1,3 MB otherwise), as the compiled code generated by GopherJS is quite large.

## Usage

The screp library can be either included in an HTML page, in which case it will be added to the global namespace as `Screp`, or it can be imported as a CommonJS module:

```js
const Screp = require('screp-js')

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

* **object**: version information in object form, with only the pertinent information included

## Copyright

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0), as per the original [screp](https://github.com/icza/screp) project.
