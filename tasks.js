/** Cleans this project, removing build artifacts. */
export async function clean() {
  await shell('shx rm -rf ./output')
  await shell('shx rm -rf ./node_modules')
}

/** Starts the project watching the ./output/bin directory. */
export async function start() {
  await shell('shx mkdir -p ./output/bin')
  await shell('shx touch ./output/bin/index.js')
  await Promise.all([
    shell(`tsc-bundle ./src/tsconfig.json --outFile ./output/bin/index.js --watch > /dev/null`),
    shell(`cd ./output/bin && smoke-run ./index.js -- node index.js ../../ --trace --cors`)
  ])
}

/** NPM packs this project. */
export async function pack() {
  await shell('shx rm -rf ./output/pack')
  await shell(`tsc-bundle ./src/tsconfig.json --outFile ./output/pack/index.js`)
  await shell(`shx cp ./src/smoke-web ./output/pack`)
  await shell(`shx cp package.json  ./output/pack`)
  await shell(`shx cp readme.md     ./output/pack`)
  await shell(`shx cp license       ./output/pack`)
  await shell('cd ./output/pack && npm pack')
  await shell('shx rm -rf ./output/pack/index.js')
  await shell('shx rm -rf ./output/pack/smoke-web')
  await shell('shx rm -rf ./output/pack/package.json')
  await shell('shx rm -rf ./output/pack/readme.md')
  await shell('shx rm -rf ./output/pack/license')
}

/** Installs this software locally. */
export async function install_cli() {
  await pack()
  await shell(`cd output/pack && npm install *.tgz -g`)
}

/** (TODO: better implementation) Builds the static html template with the given name.*/
async function build_static_templates (template) {
  const { readFile, writeFile } = require('fs')
  const { promisify }  = require('util')
  const readFileAsync  = promisify(readFile)
  const writeFileAsync = promisify(writeFile)
  const fragmentsPath  = './src/server/static/templates/fragments'
  const templatesPath  = './src/server/static/templates'
  const indent = code => code.split('\n').map(n => '      ' + n).join('\n')
  await shell(`tsc ${fragmentsPath}/directory.ts --removeComments`)
  const script = indent(await readFileAsync(`${fragmentsPath}/directory.js`, 'utf8'))
  const style  = indent(await readFileAsync(`${fragmentsPath}/directory.css`, 'utf8'))
  const content = (await readFileAsync(`${fragmentsPath}/${template}`, 'utf8'))
    .replace('{{script-element}}', ['<script>', script, '</script>'].join('\n'))
    .replace('{{style-element}}',  ['<style>', style, '</style>'].join('\n'))
  await writeFileAsync(`${templatesPath}/${template}`, content)
  await shell(`shx rm -rf ${fragmentsPath}/directory.js`)
}

/** Builds builds the reload script template. */
async function build_reload_script_template() {
  await shell(`tsc ./src/server/static/templates/fragments/reload.ts
    --outFile  ./src/server/static/templates/reload.js
    --removeComments`)
}

/** Builds 'directory' and 'not-found' static templates. */
export async function templates() {
  await build_static_templates('not-found.html')
  await build_static_templates('directory.html')
  await build_reload_script_template()
}