/* eslint-disable import/newline-after-import */
import { basename } from '@waiting/shared-core'
import rewire = require('rewire')
import { Observable } from 'rxjs'

import { EntryType, WalkEvent } from '../src/index'

// eslint-disable-next-line import/order
import assert = require('power-assert')


const filename = basename(__filename)
const mods = rewire('../src/lib/index')


describe(filename, () => {

  it('Should handleError() works with EPERM', (resolve) => {
    const fnName = 'handleError'
    const fn = mods.__get__(fnName)

    if (typeof fn !== 'function') {
      return assert(false, `${fnName} is not a function`)
    }
    const err: NodeJS.ErrnoException = new Error()

    err.code = EntryType.noAcessPermission
    err.path = Math.random().toString()

    fn(err).subscribe(
      (data) => {
        assert(data.type === EntryType.noAcessPermission)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

  it('Should handleError() works with ENOENT', (resolve) => {
    const fnName = 'handleError'
    const fn = mods.__get__(fnName)

    if (typeof fn !== 'function') {
      return assert(false, `${fnName} is not a function`)
    }
    const err: NodeJS.ErrnoException = new Error()

    err.code = EntryType.notExist
    err.path = Math.random().toString()

    fn(err).subscribe(
      (data) => {
        assert(data.type === EntryType.notExist)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

  it('Should handleError() works with unknown', (resolve) => {
    const fnName = 'handleError'
    const fn = mods.__get__(fnName)

    if (typeof fn !== 'function') {
      return assert(false, `${fnName} is not a function`)
    }
    const err: NodeJS.ErrnoException = new Error()

    err.code = EntryType.unknown
    err.path = Math.random().toString()

    fn(err).subscribe(
      (data) => {
        assert(data.type === EntryType.unknown)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

  it('Should handleError() works with unknown error.code', (resolve) => {
    const fnName = 'handleError'
    const fn = mods.__get__(fnName)

    if (typeof fn !== 'function') {
      return assert(false, `${fnName} is not a function`)
    }
    const err: NodeJS.ErrnoException = new Error()

    err.code = 'whaterror'
    err.path = Math.random().toString()

    fn(err).subscribe(
      (data) => {
        assert(data.type === EntryType.unknown)
        assert(data.path === err.path)
        resolve()
      },
    )
  })

})
