/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { lstat, readdir, Stats } from 'node:fs'
import { readlink } from 'node:fs/promises'

import {
  from as ofrom,
  merge,
  of,
  Observable,
  Observer, EMPTY,
} from 'rxjs'
import { catchError, filter, mergeMap } from 'rxjs/operators'

import { initialWalkEvent } from './config.js'
import {
  DirFilterCb,
  DirFilterCbParams,
  EntryType,
  Filename,
  Filepath,
  Options,
  WalkEvent,
  WalkFnParams,
} from './model.js'


export function entryProxy(
  path: string,
  options: Options,
  curDepth: number,
  parentPath: Filepath,
): Observable<WalkEvent> {

  const stats$ = Observable.create((obv: Observer<Stats>) => {
    lstat(path, (err, stats) => {
      if (err) {
        return obv.error(err)
      }
      obv.next(stats)
      obv.complete()
    })
  }) as Observable<Stats>

  return stats$.pipe(
    mergeMap((stats: Stats) => _entryProxy(path, stats, options, curDepth, parentPath)),
    catchError((err: Error | NodeJS.ErrnoException) => handleError(err, curDepth)),
  )
}

// eslint-disable-next-line max-params
function _entryProxy(
  path: string,
  stats: Stats,
  options: Options,
  curDepth: number,
  parentPath: Filepath,
): Observable<WalkEvent> {

  if (stats.isFile()) {
    return of<WalkEvent>({
      ...initialWalkEvent,
      depth: curDepth,
      type: EntryType.file,
      path,
      parentPath,
      stats,
    })
  }

  if (stats.isDirectory()) {
    const ret: WalkEvent = {
      ...initialWalkEvent,
      depth: curDepth,
      type: EntryType.dir,
      path,
      parentPath,
      stats,
    }

    return merge(
      of(ret),
      curDepth < options.maxDepth ? walkDir({ path, options, curDepth: curDepth + 1 }) : EMPTY,
    )
  }

  // will be trigger both EntryType.link, and EntryType.file | EntryType.dir later
  if (stats.isSymbolicLink()) {
    const ret: WalkEvent = {
      ...initialWalkEvent,
      depth: curDepth,
      type: EntryType.link,
      path,
      parentPath,
      stats,
    }

    return merge(
      of(ret),
      options.followLink && curDepth < options.maxDepth
        ? walkLink({ path, options, curDepth })
        : EMPTY
      ,
    )
  }

  return of(initialWalkEvent)
}


export function procDirfilterCb(cb: DirFilterCb, ps: DirFilterCbParams): Observable<Filepath> {
  const filterRet = cb(ps)

  if (! filterRet) {
    return EMPTY
  }
  else if (filterRet instanceof Observable) {
    return filterRet
  }
  else if (Array.isArray(filterRet) && filterRet.length) {
    return ofrom(filterRet)
  }
  else if (filterRet instanceof Promise) {
    return ofrom(filterRet).pipe(
      mergeMap((files: void | string[]) => {
        return files ? ofrom(files) : EMPTY
      }),
    )
  }

  return EMPTY
}

export function handleError(err: NodeJS.ErrnoException, curDepth: number): Observable<WalkEvent> {
  let entryType = EntryType.unknown

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const code = (err && err.code ? err.code : void 0) as EntryType || undefined

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (code) {
    switch (code) {
      case EntryType.notExist:
        entryType = EntryType.notExist
        break

      case EntryType.noAcessPermission:
        entryType = EntryType.noAcessPermission
        break

      default:
        void 0
        break
    }
  }

  return of<WalkEvent>({
    ...initialWalkEvent,
    type: entryType,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    path: err && err.path ? err.path : '',
    parentPath: '',
    depth: curDepth,
    error: err,
  })
}


export function walkDir({ path, options, curDepth }: WalkFnParams): Observable<WalkEvent> {
  const useFilter = typeof options.dirFilterCb === 'function'
  const files$ = Observable.create((obv: Observer<Filename[]>) => {
    readdir(path, (err, files) => {
      if (err) {
        return obv.error(err)
      }
      obv.next(files)
      obv.complete()
    })
  }) as Observable<Filename[]>

  const ret$ = files$.pipe(
    mergeMap((files) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (useFilter && options.dirFilterCb) {
        return procDirfilterCb(options.dirFilterCb, {
          parentPath: path,
          files,
          curDepth,
        })
      }
      return ofrom(files)
    }),
    filter((file) => {
      return !! (file && typeof file === 'string')
    }),
    mergeMap((file: string) => {
      return entryProxy(path + '/' + file, options, curDepth, path)
    }),
  )

  return ret$
}


export function walkLink({ path, options, curDepth }: WalkFnParams): Observable<WalkEvent> {
  return ofrom(readlink(path)).pipe(
    mergeMap(file => entryProxy(file, options, curDepth, path)),
  )
}

