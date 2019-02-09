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
import { promisify }                     from 'util'
import { join }                          from 'path'
import { readFile }                      from 'fs'
import { bufferHandler }                 from './buffer'
const readFileAsync = promisify(readFile)

/** Writes the 'smoke-reload' element into the given content. Attempts to insert the element intelligently. */
function writeScriptElement(content: string): string {
  const element = '<script src="/smoke/reload"></script>'
  const lines = content.split('\n')
  for(let i = lines.length - 1; i >= 0; i--) {
    const current = lines[i]
    if(current.includes('<html') || current.includes('<head')) {
      const length  = (current.length - current.trimLeft().length) + 3
      const padding = Array.from({ length: length }).join(' ')
      const footer  = lines.slice(i+1).join('\n')
      const header  = lines.slice(0, i+1).join('\n')
      const script  = [padding, element].join('')
      return [header, script, footer].join('\n')
    }
  }
  return [content, element].join('\n')
}

/** Writes HTML content to the response. Specialized to support injection of the reload script element specific to smoke. */
export async function htmlHandler (request: ServerRequest, response: ServerResponse, rootPath: string, resourcePath: string, fileSize: number) {
  const filePath = join(rootPath, resourcePath)
  const content  = await readFileAsync(filePath, 'utf8')
  const written  = writeScriptElement(content)
  const buffer   = Buffer.from(written)
  const contentType = 'text/html'
  return bufferHandler(request, response, { buffer, contentType })
}
