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

import { readCommand, RunCommand, InfoCommand } from './command'
import { createWatcher }                        from './watcher'
import { createReloadServer }                   from './server'

const green  = '\x1b[32m'
const yellow = '\x1b[33m'
const esc    = '\x1b[0m'

function info(command: InfoCommand) {
  const buffer = []
  buffer.push(...['Version 1.0.0',
  ``,
  `$ ${green}smoke-web${esc} <directory> --port <number> --trace --cors`,
  ``,
  `   Examples: ${green}smoke-run${esc} ./dist`,
  `             ${green}smoke-run${esc} ./dist --port 5001`,
  `             ${green}smoke-run${esc} ./dist --trace`,
  ``,
  `   Options:`,
  `     ${green}--port${esc}   The server port. default is 5000.`,
  `     ${green}--cors${esc}   Allow cross-origin requests.`,
  `     ${green}--trace${esc}  Print requests in terminal.`,
  ``
  ])

  console.log([...buffer, command.message, ...['']].join('\n'))
}

function run(command: RunCommand) {
  const root    = command.root
  const port    = command.port
  const trace   = command.trace
  const cors    = command.cors
  const options = { root, port, trace, cors }
  const server  = createReloadServer (options)
  createWatcher(options.root, () => server.reload())
  const app     = `${green}smoke-web${esc}`
  const hosting = `root: ${yellow}${root}${esc}`
  const onport  = `port: ${yellow}${port}${esc}`
  const tcors   = cors  ? 'cors '  : ''
  const ttrace  = trace ? 'trace ' : ''
  console.log(`${app} ${hosting} ${onport} ${tcors}${ttrace}`)
}

function main(args: string[]) {
  const command = readCommand(args)
  switch(command.type) {
    case 'info': return info(command)
    case 'run': return run(command)
  }
}

main([...process.argv])