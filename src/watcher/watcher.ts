/*--------------------------------------------------------------------------

MIT License

Copyright (c) smoke-web 2019 Haydn Paterson (sinclair) <haydn.developer@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---------------------------------------------------------------------------*/

import { ResetTimeout }                                        from './reset'
import { FSWatcher, watch, readdirSync, statSync, existsSync } from 'fs'
import { resolve, join }                                       from 'path'

/** Flatmap polyfill for node 8. */
function flatMap(array: string[][]): string[] {
  const buffer: string[] = []
  array.forEach(element => buffer.push(...element))
  return buffer
}
/** Recursively locates directory paths under the given path. */
function findDirectories(directoryPath: string): string[] {
  try {
    return [directoryPath, ...flatMap(readdirSync(directoryPath)
      .map     (path  => join(directoryPath, path))
      .filter  (entry => existsSync(entry))
      .filter  (entry => statSync(entry).isDirectory())
      .map     (entry => findDirectories(entry)))]
  } catch {
    return [directoryPath]
  }
}

export class WatchHandle {
  private watchers: FSWatcher[] = []
  public append(watchers: FSWatcher[]) {
    this.watchers.push(...watchers)
  }
  public dispose() {
    this.watchers.forEach(watcher => watcher.close())
  }
}

export type WatchFunction = (filePath: string) => void
/** Creates a file system watcher and returns a WatchHandle to the caller. */
export function createWatcher(directoryPath: string, callback: WatchFunction): WatchHandle {
  const reset       = new ResetTimeout(100)
  const handle      = new WatchHandle()
  const directories = findDirectories(resolve(directoryPath))
  handle.append(directories.map(directoryPath => watch(directoryPath, (_, path) => {
    try {
      const resolvedPath = resolve(join(directoryPath, path))
      // consideration: recursive directory watch here.
      reset.run(() => callback(resolvedPath))
    } catch { /** unsual 'path as object' error on windows. just ignore */ }
  })))
  return handle
}