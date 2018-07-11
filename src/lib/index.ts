import { lstat, readdir, readlink, Stats } from 'fs'
import { empty, from as ofrom, merge, of, Observable, Observer } from 'rxjs'
import { catchError, filter, mergeMap } from 'rxjs/operators'

import { promisify } from '../shared/index'

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


const readLinkAsync = promisify(readlink)


export function walk(
  path: string,
  options?: Partial<Options>,
): Observable<WalkEvent> {
  const opts: Options = { ...initialOptions, ...options }

  if (opts.maxDepth < 0 || ! Number.isSafeInteger(opts.maxDepth)) {
    opts.maxDepth = Number.POSITIVE_INFINITY
  }

  return entryProxy(path, opts, 0, '')
}


function entryProxy(
  path: string,
  options: Options,
  curDepth: number,
  parentPath: Filepath,
): Observable<WalkEvent> {

  const stats$ = <Observable<Stats>> Observable.create((obv: Observer<Stats>) => {
    lstat(path, (err, stats) => {
      if (err) {
        return obv.error(err)
      }
      obv.next(stats)
      obv.complete()
    })
  })

  return stats$.pipe(
    mergeMap((stats: Stats) => _entryProxy(path, stats, options, curDepth, parentPath)),
    catchError(err => handleError(err, curDepth)),
  )
}

function _entryProxy(
  path: string,
  stats: Stats,
  options: Options,
  curDepth: number,
  parentPath: Filepath,
): Observable<WalkEvent> {

  if (stats.isFile()) {
    return of(<WalkEvent> {
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
      curDepth < options.maxDepth ? walkDir({ path, options, curDepth: curDepth + 1 }) : empty(),
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
      (options.followLink && curDepth < options.maxDepth
        ? walkLink({ path, options, curDepth })
        : empty()
      ),
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

function handleError(err: any, curDepth: number): Observable<WalkEvent> {
  let entryType = EntryType.unknown

  if (err.code) {
    switch (err.code) {
      case EntryType.notExist:
        entryType = EntryType.notExist
        break

      case EntryType.noAcessPermission:
        entryType = EntryType.noAcessPermission
        break
    }
  }

  return of(<WalkEvent> {
    ...initialWalkEvent,
    type: entryType,
    path: err.path,
    parentPath: '',
    depth: curDepth,
    error: err,
  })
}


function walkDir({ path, options, curDepth }: WalkFnParams): Observable<WalkEvent> {
  const useFilter = typeof options.dirFilterCb === 'function' ? true : false
  const files$ = <Observable<Filename[]>> Observable.create((obv: Observer<Filename[]>) => {
    readdir(path, (err, files) => {
      if (err) {
        return obv.error(err)
      }
      obv.next(files)
      obv.complete()
    })
  })
  const ret$ = files$.pipe(
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
    mergeMap((file: string) => {
      return entryProxy(path + '/' + file, options, curDepth, path)
    }),
  )

  return ret$
}


function walkLink({ path, options, curDepth }: WalkFnParams): Observable<WalkEvent> {
  return ofrom(readLinkAsync(path)).pipe(
    mergeMap(file => entryProxy(file, options, curDepth, path)),
  )
}
