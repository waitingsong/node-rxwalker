import { lstat, readlink, Stats } from 'fs'
import { empty, from as ofrom, merge, of, Observable } from 'rxjs'
import { catchError, filter, mergeMap } from 'rxjs/operators'

import { join, promisify, readDirAsync } from '../shared/index'

import { initialOptions, initialWalkEvent } from './config'
import {
  DirFilterCb,
  DirFilterCbParams,
  EntryType,
  Filename,
  Filepath,
  Options,
  WalkEvent,
  WalkFnParams,
} from './model'


const lstatAsync = promisify(lstat)
const readLinkAsync = promisify(readlink)


export function walk(
  path: string,
  options?: Partial<Options>,
): Observable<WalkEvent> {
  const opts: Options = { ...initialOptions, ...options }

  if (opts.maxDepth < 0 || ! Number.isSafeInteger(opts.maxDepth)) {
    opts.maxDepth = Number.POSITIVE_INFINITY
  }

  return entryProxy(path, opts, 0)
}


function entryProxy(path: string, options: Options, curDepth: number): Observable<WalkEvent> {
  return ofrom(lstatAsync(path)).pipe(
    mergeMap((stats: Stats) => _entryProxy(path, stats, options, curDepth)),
    catchError(err => {
      const entryType = err && err.code === 'ENOENT' ? EntryType.notExist : EntryType.unknown

      return of(<WalkEvent> {
        ...initialWalkEvent,
        type: entryType,
        path: err.path,
        error: err,
      })

    }),

  )
}

function _entryProxy(path: string, stats: Stats, options: Options, curDepth: number): Observable<WalkEvent> {
  if (stats.isFile()) {
    return of(<WalkEvent> {
      ...initialWalkEvent,
      type: EntryType.file,
      path,
      stats,
    })
  }

  if (stats.isDirectory()) {
    const ret: WalkEvent = {
      ...initialWalkEvent,
      type: EntryType.dir,
      path,
      stats,
    }

    return merge(
      of(ret),
      curDepth < options.maxDepth ? walkDir({ path, options, curDepth: curDepth + 1 }) : empty(),
    )
  }

  if (stats.isSymbolicLink()) {
    const ret: WalkEvent = {
      ...initialWalkEvent,
      type: EntryType.link,
      path,
      stats,
    }

    return merge(
      of(ret),
      curDepth < options.maxDepth ? walkLink({ path, options, curDepth: curDepth + 1 }) : empty(),
    )
  }

  return of(initialWalkEvent)
}


function procDirfilterCb(cb: DirFilterCb, ps: DirFilterCbParams): Observable<Filepath> {
  const filterRet = cb(ps)

  if (! filterRet) {
    return empty()
  }
  else if (filterRet instanceof Observable) {
    return filterRet
  }
  else if (Array.isArray(filterRet) && filterRet.length) {
    return ofrom(filterRet)
  }
  else if (filterRet instanceof Promise) {
    return ofrom(filterRet).pipe(
      filter(files => files && Array.isArray(files) ? true : false),
      mergeMap((files: Filename[]) => ofrom(files)),
    )
  }

  return empty()
}


function walkDir({ path, options, curDepth }: WalkFnParams): Observable<WalkEvent> {
  const useFilter = typeof options.dirFilterCb === 'function' ? true : false
  const ret$ = ofrom(readDirAsync(path)).pipe(
    mergeMap(files => {
      if (useFilter && options.dirFilterCb) {
        return procDirfilterCb(options.dirFilterCb, {
          parentPath: path,
          files,
          curDepth,
        })
      }
      return ofrom(files)
    }),
    filter(file => file && typeof file === 'string' ? true : false),
    mergeMap(file => {
      return entryProxy(join(path, file), options, curDepth)
    }),
  )
  return ret$
}



function walkLink({ path, options, curDepth }: WalkFnParams): Observable<WalkEvent> {
  const ret$ = ofrom(readLinkAsync(path)).pipe(
    mergeMap(files => {
      return ofrom(files).pipe(
        mergeMap(file => {
          return entryProxy(join(path, file), options, curDepth)
        }),
      )

    }),

  )
  return ret$
}
