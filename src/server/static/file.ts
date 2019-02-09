
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

import { ServerRequest, ServerResponse } from 'http'
import { join, basename }                from 'path'
import { createReadStream }              from 'fs'
import { mime }                          from './mime'

/** Computes a best attempt filename for the given file path. */
function fileDisposition(filePath: string): string {
  return basename(filePath).replace(/[^0-9a-zA-Z-\.]/gi, '-')
}
/** Reads the byte offset from the given 'range' header value. */
function readRangeOffset(range: string): number {
  const result = range.match(/bytes=([\d]+)-([\d]*)?/)
  return (result)
    ? parseInt(result[1])
    : 0
}

/** Writes raw file content to the response. May returned a 'partial' response if the agent passes a 'range' header. */
export async function fileHandler (request: ServerRequest, response: ServerResponse, rootPath: string, resourcePath: string, fileSize: number) {
  const filePath = join(rootPath, resourcePath)
  const range = request.headers['range'] as string
  if(range) {
    const offset = readRangeOffset(range)
    if(offset < fileSize) {
      const total  = fileSize
      const start  = offset
      const end    = (fileSize - 1)
      const length = (end - start) + 1
      const range_out = `bytes ${start}-${end}/${total}`
      const readable  = createReadStream(filePath, { start, end })
      response.statusCode = 206
      response.setHeader('Content-Type',        `${mime(filePath)}`)
      response.setHeader('Content-Length',      `${length}`)
      response.setHeader('Content-Range',       `${range_out}`)
      response.setHeader('Content-Disposition', `inline; filename=${fileDisposition(filePath)}`)
      response.setHeader('Cache-Control',       'public')
      readable.pipe(response)
      return
    }
  }
  const readable = createReadStream(filePath)
  response.statusCode = 200
  response.setHeader('Content-Type',        `${mime(filePath)}`)
  response.setHeader('Content-Length',      `${fileSize}`)
  response.setHeader('Content-Disposition', `inline; filename=${fileDisposition(filePath)}`)
  response.setHeader('Cache-Control',       'public')
  readable.pipe(response)
}
