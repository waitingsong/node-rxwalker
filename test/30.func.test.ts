import assert from 'node:assert/strict'

import { fileShortPath } from '@waiting/shared-core'

import { EntryType } from '../src/index.js'
import { handleError } from '../src/lib/helper.js'


describe(fileShortPath(import.meta.url), () => {

  it('Should handleError() work with EPERM', (resolve) => {
    const err: NodeJS.ErrnoException = new Error()

    err.code = EntryType.noAcessPermission
    err.path = Math.random().toString()

    handleError(err, 0).subscribe(
      (data) => {
        assert(data.type === EntryType.noAcessPermission)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

  it('Should handleError() work with ENOENT', (resolve) => {
    const err: NodeJS.ErrnoException = new Error()
    err.code = EntryType.notExist
    err.path = Math.random().toString()

    handleError(err, 0).subscribe(
      (data) => {
        assert(data.type === EntryType.notExist)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

  it('Should handleError() work with unknown', (resolve) => {
    const err: NodeJS.ErrnoException = new Error()
    err.code = EntryType.unknown
    err.path = Math.random().toString()

    handleError(err, 0).subscribe(
      (data) => {
        assert(data.type === EntryType.unknown)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

  it('Should handleError() works with unknown error.code', (resolve) => {
    const err: NodeJS.ErrnoException = new Error()
    err.code = 'whaterror'
    err.path = Math.random().toString()

    handleError(err, 0).subscribe(
      (data) => {
        assert(data.type === EntryType.unknown)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

})
