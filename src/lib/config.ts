import { empty, from as ofrom } from 'rxjs'
import { filter } from 'rxjs/operators'

import {
  DirFilterCbParams,
  DirFilterCbRet,
  EntryType,
  Options,
  WalkEvent,
} from './model'


export const initialOptions: Options = {
  maxDepth: Number.POSITIVE_INFINITY,
  dirFilterCb: initialDirFilterFn,
  followLink: true,
}

export const initialWalkEvent: WalkEvent = {
  type: EntryType.unknown,
  path: '',
}

function initialDirFilterFn(ps: DirFilterCbParams): DirFilterCbRet {
  if (Array.isArray(ps.files) && ps.files.length) {
    return ofrom(ps.files).pipe(
      filter(file => !! file),
    )
  }
  return empty()
}
