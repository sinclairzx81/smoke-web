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

export interface InfoCommand {
  type:   'info'
  message: string
}

export interface RunCommand {
  type:  'run'
  root:  string
  port:  number
  trace: boolean
  cors:  boolean
}
export type Command = InfoCommand | RunCommand

/** Parses out the command line args, returns a command to run. */
export function readCommand(args: string[]): Command {
  // shift prefix.
  const process = args.shift()!
  const script  = args.shift()!
  
  // no arguments: info
  if(args.length === 0) {
    const type    = 'info'
    const message = `No <directory> path specified.`
    return { type, message }
  }

  // run command: defaults
  const command: RunCommand = { 
    type:  'run',
    root:  args.shift()!,
    port:  5000,
    trace: false,
    cors:  false
  }
  // parse args:
  while(args.length > 0) {
    const current = args.shift()!
    switch(current) {
      case '--port': {
        if(args.length === 0) {
          const type = 'info'
          const message = 'Expected <port>'
          return { type, message }
        }
        command.port = parseInt(args.shift()!)
        break
      }
      case '--trace': {
        command.trace = true
        break
      }
      case '--cors': {
        command.cors = true
        break
      }
    }
  }
  return command
}