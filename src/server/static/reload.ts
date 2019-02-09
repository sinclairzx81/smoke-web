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

import reload                            from 'text!./templates/reload.js'
import { ServerRequest, ServerResponse } from 'http'
import { uuid }                          from './uuid'

const keepalive = []
const clients   = new Map<string, ServerResponse>()

/** Asserts the keepalive loop is running, if not, start it. */
function assertKeepAlive() {
  if(keepalive.length === 0) {
    keepalive.push(setInterval(() => {
      for(const key of clients.keys()) {
        clients.get(key)!.write('ping')
      }
    }, 16000))
  }
}

/** Serves the reload script. */
export function reloadHandler(request: ServerRequest, response: ServerResponse) {
  assertKeepAlive()
  const buffer = Buffer.from(reload)
  response.setHeader('Content-Type', 'text/javascript')
  response.setHeader('Content-Length', buffer.length)
  response.write(buffer)
  response.end()
}

/** Accepts incoming requests made from the reload script, pushes responses into a client hash. */
export function signalHandler(request: ServerRequest, response: ServerResponse) {
  response.setHeader('Connection',        "Transfer-Encoding")
  response.setHeader('Content-Type',      "text/html; charset=utf-8")
  response.setHeader('Transfer-Encoding', "chunked")
  response.setHeader("Cache-Control",     "no-cache, no-store, must-revalidate")
  response.setHeader("Pragma",            "no-cache")
  response.setHeader("Expires",           "0")
  response.statusCode = 200
  response.write("established")
  const clientid = uuid()
  clients.set(clientid, response)
  response.on('close', () => clients.delete(clientid))
}

/** Signals a reload to all listening clients. */
export function signalReload() {
  for(const key of clients.keys()) {
    const client = clients.get(key)!
    client.write('reload')
  }
}