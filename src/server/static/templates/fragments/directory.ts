/** Files array, built onload. */
const FILES: FileEntry[] = []
interface FileEntry {
  className: string
  alt:       string
  href:      string
  name:      string
}

/** Reads elements from the dom. */
const getDirectory = () => document.querySelector('#directory')  as HTMLDivElement
const getFileList  = () => document.querySelector('.listing ul') as HTMLUListElement
const getSearch    = () => document.querySelector('#search')     as HTMLInputElement

/** Reads file info from elements. */
const readfiles    = () => {
  const list = getFileList()
  for(let i = 0; i < list.children.length; i++) {
    const item   = list.children[i] as HTMLLIElement
    const anchor =  item.querySelector('a') as HTMLAnchorElement
    if(!item || !anchor) { continue }
    const className = item.getAttribute('class')
    const alt       = anchor.getAttribute('alt')
    const href      = anchor.getAttribute('href')
    const name      = anchor.innerHTML
    FILES.push({ className, alt, href, name })
  }
}

/** Runs a search across files. */
const search = () => {
  const search  = getSearch()
  const list    = getFileList()
  const entries = FILES.filter(entry => entry.name.indexOf(search.value) !== -1)
  const content = entries.map(entry => {
    return `<li class='${entry.className}'><a alt='${entry.alt}' href='${entry.href}'>${entry.name}</a></li>`
  })
  list.innerHTML = content.join('')
}

/** Run on start-up. */
window.addEventListener('load', () => {
  if(getDirectory()) {
    getSearch().addEventListener('input', () => search())
    readfiles()
  }
})