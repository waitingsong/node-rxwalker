# rxwalker
响应式递归读取目录及文件，通过过滤回调函数可实现更灵活的搜索控制

[![Version](https://img.shields.io/npm/v/rxwalker.svg)](https://www.npmjs.com/package/rxwalker)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://travis-ci.org/waitingsong/node-rxwalker.svg?branch=master)](https://travis-ci.org/waitingsong/node-rxwalker)
[![Build status](https://ci.appveyor.com/api/projects/status/jt1a2bo4jk6b9728/branch/master?svg=true)](https://ci.appveyor.com/project/waitingsong/node-rxwalker/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/waitingsong/node-rxwalker/badge.svg?branch=master)](https://coveralls.io/github/waitingsong/node-rxwalker?branch=master)


## 安装
```powershell
npm install --save rxwalker
```

## 使用
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

const maxDepth = 7 // <--- 递归最大深度
let dirCount = 0
let fileCount = 0
let entryCount = 0

walk('<path>', { maxDepth }).subscribe(
  data => {
    switch (data.type) {
      case EntryType.dir:
        console.info('got a dir', data)
        dirCount += 1
        break

      case EntryType.file:
        console.info('got a file', data)
        fileCount += 1
        break

      case EntryType.unknown:
        console.info('got a unknow entry', data)
        break
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
    return file.includes('a') ? true : false  // <--- 过滤文件名、目录名
  })
}

walk('<path>', { dirFilterCb }).subscribe(
  data => {
    switch (data.type) {
      case EntryType.dir:
        console.info('got a dir', data)
        dirCount += 1
        break

      case EntryType.file:
        console.info('got a file', data)
        fileCount += 1
        break

      case EntryType.unknown:
        console.info('got a unknow entry', data)
        break
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



## 版权
[MIT](LICENSE)


### Languages
- [English](README.md)
- [中文](README.zh-CN.md)