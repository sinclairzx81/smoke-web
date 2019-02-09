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

import { promisify }        from 'util'
import { stat, exists }     from 'fs'
import { basename }         from 'path'
import { mime as get_mime } from './mime'


const existsAsync = promisify(exists)
const statAsync   = promisify(stat)

/** Checks if the given filePath is 'inside' the given root path. */
export function isInsideRoot(rootPath: string, filePath: string): boolean {
  return filePath.indexOf(rootPath) === 0
}

export interface FileInfo {
  type: 'file' | 'html' | 'directory' | 'not-found'
  name: string,
  path: string,
  mime: string
  size: number
}

/** Returns high level meta information about the given filePath. */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const name = basename(filePath)
  const path = filePath
  if (!(await existsAsync(filePath))) {
    const type = 'not-found'
    const size = 0
    const mime = 'application/octet-stream'
    return { type, size, name, path, mime }
  }
  const info = await statAsync(filePath)
  if (info.isDirectory()) {
    const type = 'directory'
    const mime = 'application/octet-stream'
    const size = 0
    return { type, size,  name, path, mime }
  } else if (info.isFile()) {
    const size = info.size
    const mime = get_mime(filePath)
    const type = mime === 'text/html' ? 'html' : 'file'
    return { type, size, name, path, mime }
  } else {
    const type = 'not-found'
    const mime = 'application/octet-stream'
    const size = 0
    return { type, size, name, path, mime }
  }
}
