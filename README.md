# [rxwalker](https://waitingsong.github.io/node-rxwalker/)

A reactive nodejs directory walker. More flexible control via filename and recursive depth.

[![Version](https://img.shields.io/npm/v/rxwalker.svg)](https://www.npmjs.com/package/rxwalker)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()
[![ci](https://github.com/waitingsong/node-rxwalker/workflows/ci/badge.svg)](https://github.com/waitingsong/node-rxwalker/actions?query=workflow%3A%22ci%22)
[![Build status](https://ci.appveyor.com/api/projects/status/jt1a2bo4jk6b9728/branch/master?svg=true)](https://ci.appveyor.com/project/waitingsong/node-rxwalker/branch/master)
[![codecov](https://codecov.io/gh/waitingsong/node-rxwalker/branch/master/graph/badge.svg?token=SjZLx1qd9O)](https://codecov.io/gh/waitingsong/node-rxwalker)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)


## Installing
```powershell
npm install --save rxwalker
```

## Usage
```js
// js
const walk = require('rxwalker').walk

walk('<path>').subscribe(
  data => console.info(data),
)
```

```ts
// es6 or typescript
import { walk } from 'rxwalker'

walk('<path>').subscribe(
  data => console.info(data),
)
```

```ts
import { walk, EntryType } from 'rxwalker'

const maxDepth = 7 // <--- walk with maxDepth
let dirCount = 0
let fileCount = 0
let linkCount = 0
let entryCount = 0

walk('<path>', { maxDepth }).subscribe(
  data => {
    switch (data.type) {
      case EntryType.dir:
        console.info('got a dir', data)
        dirCount += 1
        entryCount += 1
        break

      case EntryType.file:
        console.info('got a file', data)
        fileCount += 1
        entryCount += 1
        break

      case EntryType.link:
        console.info('got a symbolicLink', data)
        linkCount += 1
        // entryCount += 1
        break

      case EntryType.noAcessPermission:
        console.info('got a entry without access permission', data)
        entryCount += 1
        break

      case EntryType.unknown:
        console.info('got a unknow entry', data)
        break

      case EntryType.notExist:
        console.error('entry not exists:', data.path)
        break
    }
  },
  err => console.error(err),
  () => {
    console.info(`count result dirs: ${dirCount}, files: ${fileCount}, links: ${linkCount}, entries: ${entryCount} `)
  },
)
```


```ts
import { walk, DirFilterCbParams, DirFilterCbRet, EntryType } from 'rxwalker'

let dirCount = 0
let fileCount = 0
let linkCount = 0
let entryCount = 0

const dirFilterCb = ({ files }: DirFilterCbParams): DirFilterCbRet => {
  return files.filter(file => {
    return file.includes('a') ? true : false  // <--- filter filename/dirname
  })
}

walk('<path>', { dirFilterCb }).subscribe(
  data => {
    switch (data.type) {
      case EntryType.dir:
        console.info('got a dir', data)
        dirCount += 1
        entryCount += 1
        break

      case EntryType.file:
        console.info('got a file', data)
        fileCount += 1
        entryCount += 1
        break

      case EntryType.link:
        console.info('got a symbolicLink', data)
        linkCount += 1
        // entryCount += 1
        break

      case EntryType.noAcessPermission:
        console.info('got a entry without access permission', data)
        entryCount += 1
        break

      case EntryType.unknown:
        console.info('got a unknow entry', data)
        break

      case EntryType.notExist:
        console.error('entry not exists:', data.path)
        break
    }

  },
  err => console.error(err),
  () => {
    console.info(`count result dirs: ${dirCount}, files: ${fileCount}, links: ${linkCount}, entries: ${entryCount} `)
  },
)
```

```ts
// stop running walker conditionally
import { walk } from 'rxwalker'

const sub = walk('<path>').subscribe(
  data => {
    if (data.path.includes('a')) {
      sub.unsubscribe()
      console.log('stopped with:', data)
    }
    else {
      console.log(data)
    }
  }
)
```

```ts
// no follow symbol link
import { walk } from 'rxwalker'

walk('<path>', { followLink: false }).subscribe(
  data => console.log(data),
)
```

## Demo
- [Demos from test](https://github.com/waitingsong/node-rxwalker/blob/master/test/20_index.test.ts)


## License
[MIT](LICENSE)


### Languages
- [English](README.md)
- [中文](README.zh-CN.md)
