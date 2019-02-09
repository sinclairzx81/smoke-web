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

interface BufferHandlerOptions { 
  status?:      number, 
  contentType?: string,
  buffer?:      Buffer 
}

/** Writes a raw buffer to the output stream. */
export async function bufferHandler (request: ServerRequest, response: ServerResponse, options: BufferHandlerOptions) {
  options.status      = options.status      || 200
  options.contentType = options.contentType || 'text/plain'
  options.buffer      = options.buffer      || Buffer.alloc(0)
  response.setHeader('Content-Type',   options.contentType)
  response.setHeader('Content-Length', options.buffer.length)
  response.statusCode = options.status
  response.write(options.buffer)
  response.end()
}
