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

import directoryTemplate                   from 'text!./templates/directory.html'
import { ServerRequest, ServerResponse }   from 'http'
import { promisify }                       from 'util'
import { join }                            from 'path'
import { readdir }                         from 'fs'
import { getFileInfo, FileInfo }           from './util'
import { bufferHandler }                   from './buffer'
import { htmlHandler }                     from './html'
const readdirAsync = promisify(readdir)

/** Truncates the display name to 24 characters. */
function truncateFileDisplayName(name: string): string {
  if(name.length > 24) {
    const start = name.slice(0, 12)
    const end   = name.slice(name.length - 12)
    return [start, end].join('&#8230;')
  }
  return name
}

/** Sorts file info elements by directories, then files. */
function sortFileInfos(infos: FileInfo[]): FileInfo[] {
  const directories = infos.filter(info => info.type === 'directory').sort((l, r) => l.name.localeCompare(r.name))
  const files       = infos.filter(info => info.type !== 'directory').sort((l, r) => l.name.localeCompare(r.name))
  return [...directories, ...files]
}

/** Builds the directory listings. Returns raw HTML that is written into the 'directory.html' output. */
async function buildDirectoryListing(rootPath: string, resourcePath: string): Promise<string> {
  const directoryPath = join(rootPath, resourcePath)
  const contents = await readdirAsync(directoryPath)
  const infos = sortFileInfos(await Promise.all(contents.map(async path => {
    return await getFileInfo(join(directoryPath, path))
  })))
  const elements = await Promise.all(infos.map(async info => {
    const href  = join(resourcePath, info.name)
    const name  = truncateFileDisplayName(info.name)
    const klass = info.type === 'directory' ? 'directory-item' : 'file-item'
    return `<li class='${klass}'><a alt="${info.name}" href="${href}">${name}</a></li>`
  }))
  return elements.join('\n')
}

/** Builds the directory breadcrumb. Returns raw HTML that is written into the 'directory.html' output. */
function buildBreadcrumb(rootPath: string, resourcePath: string) {
  const parts = resourcePath.split('/').map(n => n.trim()).filter(n => n !== '')
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

/** Handles rendering the directory listings. Writes raw HTML to the response. */
async function directoryListingHandler(request: ServerRequest, response: ServerResponse, rootPath: string, resourcePath: string) {
  const listing    = await buildDirectoryListing(rootPath, resourcePath)
  const breadcrumb = buildBreadcrumb(rootPath, resourcePath)
  const template   = directoryTemplate
    .replace(new RegExp('{{breadcrumb}}', 'g'), breadcrumb)
    .replace(new RegExp('{{listing}}', 'g'), listing)
  const contentType = 'text/html'
  const buffer = Buffer.from(template)
  bufferHandler(request, response, { buffer, contentType })
}

/** Handles directory rendering. Will either return the 'index.html' file if found, or the smoke directory listings. */
export async function directoryHandler(request: ServerRequest, response: ServerResponse, rootPath: string, resourcePath: string) {
  const directoryPath = join(rootPath, resourcePath)
  const indexPath = join(directoryPath, 'index.html')
  const indexInfo = await getFileInfo(indexPath)
  return (indexInfo.type !== 'html')
     ? directoryListingHandler(request, response, rootPath, resourcePath)
     : htmlHandler(request, response, rootPath, resourcePath + '/index.html', indexInfo.size)
}
