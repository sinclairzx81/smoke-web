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
import { resolve, join }                 from 'path'
import { isInsideRoot, getFileInfo }     from './util'
import { directoryHandler }              from './directory'
import { fileHandler }                   from './file'
import { htmlHandler }                   from './html'
import { notfoundHandler }               from './not-found'

export async function staticFileHandler(root: string, request: ServerRequest, response: ServerResponse) {
  const rootPath = resolve(root)
  const resourcePath = decodeURI(request.url!)
  const filePath = resolve(join(rootPath, resourcePath))
  if(!isInsideRoot(rootPath, filePath)) {
    return notfoundHandler(request, response, rootPath, resourcePath)
  }
  const info = await getFileInfo(filePath)
  switch(info.type) {
    case 'not-found': return notfoundHandler(request, response, rootPath, resourcePath)
    case 'directory': return directoryHandler(request, response, rootPath, resourcePath)
    case 'file':      return fileHandler(request, response, rootPath, resourcePath, info.size)
    case 'html':      return htmlHandler(request, response, rootPath, resourcePath, info.size)
  }
}