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

import { createServer, Server } from 'http'
import { staticFileHandler }    from './static'
import { notfoundHandler }      from './static'
import { signalHandler }        from './static'
import { signalReload }         from './static'
import { reloadHandler }        from './static'
import { corsHandler }          from './static'

export interface ReloadServerOptions {
  root:  string
  port:  number
  trace: boolean
  cors:  boolean
}
export class ServerHandle {
  constructor(private server: Server) {}
  public reload() {
    signalReload()
  }
  public dispose() {
    this.server.close()
  }
}

/** Spawns a the static server and returns a handle to the caller. */
export function createReloadServer(options: ReloadServerOptions): ServerHandle {
  return new ServerHandle(createServer((request, response) => {
    // http request tracing | ignore smoke-endpoints
    if(options.trace && request.url !== '/smoke/signal' && request.url !== '/smoke/reload') {
      const yellow    = '\x1b[33m'
      const esc       = '\x1b[0m'
      const method    = `${yellow}${request.method}${esc}`
      const endpoint  = `${request.url}`
      console.log(`${method} ${endpoint}`)
    }

    // discard non-get requests.
    if(!request.method || request.method.toLowerCase() !== 'get') {
      return notfoundHandler(request, response, options.root, request.url!)
    }
    
    // handle cors if enabled.
    if(options.cors) {
      corsHandler(request, response)
    }
    
    // process signal | reload | any requests.
    switch(request.url) {
      case '/smoke/reload': return reloadHandler(request, response)
      case '/smoke/signal': return signalHandler(request, response)
      default: return staticFileHandler(options.root, request, response)
    }

  }).listen(options.port))
}
