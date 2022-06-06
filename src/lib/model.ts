import { Stats } from 'node:fs'

import { Observable } from 'rxjs'


export type Filename = string
export type Filepath = string
export type DirFilterCbRet = Filename[] | Promise<Filename[] | void> | Observable<Filename> | void

export interface Options {
  maxDepth: number // if negative then infinite
  dirFilterCb: DirFilterCb
  /**
   * whether travel symbolicLink
   * if true, will trigger type with symbolicLink,
   * and then a type with file or directory later
   * default value TRUE
   */
  followLink: boolean
}

export type DirFilterCb = (params: DirFilterCbParams) => DirFilterCbRet
export interface DirFilterCbParams {
  parentPath: Filepath
  files: Filename[]
  curDepth: number
}


export interface WalkEvent {
  depth: number
  type: EntryType
  path: Filepath
  // may different from dirname(path) cause of symbolicLink
  parentPath: Filepath
  stats?: Stats
  error?: Error
}

export const enum EntryType {
  unknown = 'unknown',
  notExist = 'ENOENT',
  noAcessPermission = 'EPERM',
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
  path: Filepath // dir
}
