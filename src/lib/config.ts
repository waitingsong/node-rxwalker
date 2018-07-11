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
  depth: 0,
  type: EntryType.unknown,
  path: '',
  parentPath: '',
}

function initialDirFilterFn(ps: DirFilterCbParams): DirFilterCbRet {
  if (Array.isArray(ps.files) && ps.files.length) {
    return ofrom(ps.files).pipe(
      filter(file => !! file),
    )
  }
  return empty()
}
