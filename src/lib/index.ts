import { Observable } from 'rxjs'

import { initialOptions } from './config.js'
import { entryProxy } from './helper.js'
import {
  Options,
  WalkEvent,
} from './model.js'


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
