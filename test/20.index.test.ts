import assert from 'node:assert/strict'
import { join } from 'node:path'

import { fileShortPath } from '@waiting/shared-core'

import {
  walk,
  DirFilterCbParams,
  DirFilterCbRet,
  EntryType,
} from '../src/index.js'

import { testDir } from '#@/root.config.js'


describe(fileShortPath(import.meta.url), () => {

  it('Should walk() works', (resolve) => {
    const path = join(testDir, 'test_dirs')
    const assertDirCount = 7
    const assertFileCount = 8
    let dirCount = 0
    let fileCount = 0
    let linkCount = 0
    let entryCount = 0


    walk(path).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.link:
            linkCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })

  it('Should walk() works', (resolve) => {
    const path = join(testDir, 'test_dirs/dir-level1-a')
    const assertDirCount = 2
    const assertFileCount = 2
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0

    walk(path).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })

  it('Should walk() works with path not existing', (resolve) => {
    const path = join(testDir, 'test_dirsFAKE')
    const assertDirCount = 0
    const assertFileCount = 0
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0

    walk(path).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })


  it('Should walk() works with options.maxDepth == 0', (resolve) => {
    const path = join(testDir, 'test_dirs')
    const assertDirCount = 1
    const assertFileCount = 0
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0
    const maxDepth = 0

    walk(path, { maxDepth }).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })

  it('Should walk() works with options.maxDepth == 1', (resolve) => {
    const path = join(testDir, 'test_dirs')
    const assertDirCount = 4
    const assertFileCount = 2
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0
    const maxDepth = 1

    walk(path, { maxDepth }).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })

  it('Should walk() works with DirFilterCb returining Array', (resolve) => {
    const path = join(testDir, 'test_dirs')
    const assertDirCount = 7
    const assertFileCount = 8
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0

    const dirFilterCb = ({ files }: DirFilterCbParams): DirFilterCbRet => {
      return files
    }

    walk(path, { dirFilterCb }).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })

  it('Should walk() works with DirFilterCb returining Array filtered by name', (resolve) => {
    const path = join(testDir, 'test_dirs')
    // test_dirs, test_dirs/dir-level1-a, test_dirs/dir-level1-a/dir-level2-a
    const assertDirCount = 3
    // test_dirs/level1-a.txt, test_dirs/dir-level1-a/level2-a.txt, test_dirs/dir-level1-a/dir-level2-a/level3-a.txt
    const assertFileCount = 3
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0

    const dirFilterCb = ({ files }: DirFilterCbParams): DirFilterCbRet => {
      return files.filter((file) => {
        return file.includes('a') ? true : false
      })
    }

    walk(path, { dirFilterCb }).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })


  it('Should walk() works with DirFilterCb returining Array filtered by parentPath', (resolve) => {
    const path = join(testDir, 'test_dirs')
    // test_dirs, test_dirs/dir-level1-a, test_dirs/dir-level1-b, test_dirs/dir-level1-z,
    // dir-level1-a/dir-level2-a
    const assertDirCount = 5
    // test_dirs/level1-a.txt, test_dirs/level1-b.txt
    // test_dirs/dir-level1-a/level2-a.txt, test_dirs/dir-level1-a/dir-level2-a/level3-a.txt
    const assertFileCount = 4
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0

    const dirFilterCb = ({ parentPath, files, curDepth }: DirFilterCbParams): DirFilterCbRet => {
      if (curDepth > 1) {
        if (/test_dirs\/[\w\d/-]+?a/u.exec(parentPath.replace(/\\/g, '/'))) {
          return files
        }
      }
      else {
        return files
      }
    }

    walk(path, { dirFilterCb }).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })

  })


  it('Should walk() works with DirFilterCb returining Array filtered by name and maxDepth', (resolve) => {
    const path = join(testDir, 'test_dirs')
    const assertDirCount = 2 // test_dirs, test_dirs/dir-level1-a
    const assertFileCount = 1 // test_dirs/level1-a.txt
    let dirCount = 0
    let fileCount = 0
    let entryCount = 0

    const dirFilterCb = ({ files, curDepth }: DirFilterCbParams): DirFilterCbRet => {
      return files.filter((file) => {
        return file.includes('a') && curDepth < 2 ? true : false
      })
    }

    walk(path, { dirFilterCb }).subscribe({
      next(data) {
        switch (data.type) {
          case EntryType.dir:
            dirCount += 1
            entryCount += 1
            break

          case EntryType.file:
            fileCount += 1
            entryCount += 1
            break

          case EntryType.noAcessPermission:
            entryCount += 1
            break
        }
      },

      error(err) {
        assert(false, (err as Error).message)
      },

      complete() {
        assertCount({
          path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
        })
        resolve()
      },
    })
  })


})

interface AssertCountParams {
  path: string
  dirCount: number
  fileCount: number
  entryCount: number
  assertDirCount: number
  assertFileCount: number
}

function assertCount({
  path, dirCount, fileCount, entryCount, assertDirCount, assertFileCount,
}: AssertCountParams): void {

  console.info(`path: "${path}": dirCount: ${dirCount}, fileCount: ${fileCount}, entryCount: ${entryCount}\n`)
  assert(dirCount === assertDirCount, 'dirs not equivalent')
  assert(fileCount === assertFileCount, 'files not equivalent')
  assert(dirCount + fileCount === assertDirCount + assertFileCount, 'entries not equivalent')
}
