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

import notfoundTemplate                  from 'text!./templates/not-found.html'
import { ServerRequest, ServerResponse } from 'http'
import { bufferHandler }                 from './buffer'
import { basename }                      from 'path'

/** Builds the directory breadcrumb. Returns raw HTML that is written into the 'directory.html' output. */
function buildBreadcrumb(rootPath: string, resourcePath: string) {
  const parts = resourcePath.split('/').map(n => n.trim()).filter(n => n !== '')
  parts.pop()
  const items = parts.map((part, index) => {
    const path = []
    for(let ix = 0; ix < (index + 1); ix++) {
      path.push(parts[ix])
    }
    return { name: part, href: encodeURI('/' + path.join('/')) }
  })
  items.unshift({ name: 'root', href: '/' })
  return items.map(({name, href}) => `<li><a href='${href}'>${name}</a></li>`).join('\n')
}

/** Writes a 404 response using the smoke template. */
export async function notfoundHandler(request: ServerRequest, response: ServerResponse, rootPath: string, resourcePath: string) {
  const breadcrumb = buildBreadcrumb(rootPath, resourcePath)
  const template   = notfoundTemplate
    .replace(new RegExp('{{breadcrumb}}', 'g'), breadcrumb)
    .replace(new RegExp('{{filename}}', 'g'), basename(resourcePath))
  const contentType = 'text/html'
  const buffer      = Buffer.from(template)
  const status      = 404
  bufferHandler(request, response, { buffer, contentType, status })
}