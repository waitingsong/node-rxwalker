# rxwalker
A reactive nodejs directory walker. More flexible control via filename and recursive depth.

[![Version](https://img.shields.io/npm/v/rxwalker.svg)](https://www.npmjs.com/package/rxwalker)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/waitingsong/node-rxwalker.svg?branch=master)](https://travis-ci.org/waitingsong/node-rxwalker)
[![Build status](https://ci.appveyor.com/api/projects/status/jt1a2bo4jk6b9728/branch/master?svg=true)](https://ci.appveyor.com/project/waitingsong/node-rxwalker/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/waitingsong/node-rxwalker/badge.svg?branch=master)](https://coveralls.io/github/waitingsong/node-rxwalker?branch=master)


## Installing
```powershell
npm install --save rxwalker
```

## Usage
```ts
import walk from 'rxwalker'

let dirCount = 0
let fileCount = 0
let entryCount = 0

walk('<path>').subscribe(
  data => console.info(data),
)
```

```ts
import { walk, EntryType } from 'rxwalker'

const maxDepth = 7 // <--- walk with maxDepth
let dirCount = 0
let fileCount = 0
let entryCount = 0

walk('<path>', { maxDepth }).subscribe(
  data => {
    if (data.type === EntryType.dir) {
      console.info('got a dir', data)
      dirCount += 1
    }
    else if (data.type === EntryType.file) {
      console.info('got a file', data)
      fileCount += 1
    }
    else if (data.type === EntryType.unknown) {
      console.info('got a unknow entry', data)
    }

    if (data.type === EntryType.notExist) {
      console.error('entry not exists:', data.path)
    }
    else {
      entryCount += 1
    }
  },
  err => console.error(err),
  () => {
    console.info(`count result dirs: ${dirCount}, files: ${fileCount}, entries: ${entryCount}`)
  },
)
```


```ts
import { walk, DirFilterCbParams, DirFilterCbRet, EntryType } from 'rxwalker'

let dirCount = 0
let fileCount = 0
let entryCount = 0

const dirFilterCb = ({ files }: DirFilterCbParams): DirFilterCbRet => {
  return files.filter(file => {
    return file.includes('a') ? true : false  // <--- filter filename/dirname
  })
}

walk('<path>', { dirFilterCb }).subscribe(
  data => {
    if (data.type === EntryType.dir) {
      console.info('got a dir', data)
      dirCount += 1
    }
    else if (data.type === EntryType.file) {
      console.info('got a file', data)
      fileCount += 1
    }
    else if (data.type === EntryType.unknown) {
      console.info('got a unknow entry', data)
    }

    if (data.type === EntryType.notExist) {
      console.error('entry not exists:', data.path)
    }
    else {
      entryCount += 1
    }
  },
  err => console.error(err),
  () => {
    console.info(`count result dirs: ${dirCount}, files: ${fileCount}, entries: ${entryCount}`)
  },
)
```


## Demo
- [Demos from test](https://github.com/waitingsong/node-rxwalker/blob/master/test/20_index.test.ts)


## License
[MIT](LICENSE)


### Languages
- [English](README.md)
- [中文](README.zh-CN.md)
