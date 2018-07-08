import { Stats } from 'fs'
import { Observable } from 'rxjs'

export type Filename = string
export type Filepath = string
export type DirFilterCbRet = Filename[] | Promise<Filename[]> | Observable<Filename>

export interface Options {
  maxDepth: number // if negative then infinite
  dirFilterCb: DirFilterCb
}

export type DirFilterCb = (params: DirFilterCbParams) => DirFilterCbRet
export interface DirFilterCbParams {
  parentPath: Filepath
  files: Filename[]
  curDepth: number
}


export interface WalkEvent {
  type: EntryType
  path: Filepath
  stats?: Stats
  error?: Error
}

export const enum EntryType {
  unknown = 'unknown',
  file = 'file',
  dir = 'directory',
  block = 'blockDevice',
  char = 'characterDevice',
  fifo = 'fifo',
  socket = 'socket',
  link = 'symbolicLink',
}

export interface WalkFnParams {
  curDepth: number
  options: Options
  path: Filepath  // dir
}
