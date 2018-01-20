const fs = require('fs-extra')
const watch = require('node-watch')
const UglifyJS = require('uglify-es')
const Babel = require('babel-core')

watch('./dev/js/', { recursive: true }, (evt, name) => {
  comiple(name)
})

fs.readdir('./dev/js/', (err, items) => {
  for (let i = 0; i < items.length; i++) {
    let name = `./dev/js/${items[i]}`
    comiple(name)
  }
})

// copy the vue file to the www/js direcotry
let vuefile = (globconf.dev) ? './node_modules/vue/dist/vue.js' : './node_modules/vue/dist/vue.min.js'
fs.copy(vuefile, './www/js/vue.js', () => {
  log(`copied vue.js file`)
})

let muxfile = (globconf.dev) ? './node_modules/mux.js/dist/mux.js' : './node_modules/mux.js/dist/mux.min.js'
fs.copy(muxfile, './www/js/mux.js', () => {
  log(`copied vue.js file`)
})

let comiple = (name) => {
  let to = name.replace('dev/','www/').replace('dev\\','www\\')
  if (globconf.dev) {
    // only copy the file to the www/js/ direcory this is better for debugging
    fs.copy(name, to, () => {
      log(`copied js file from ${name} to ${to}`)
    })
  } else {
    // uglify the file and place in the www/js/ direcotry
    fs.readFile(name, 'utf8', (err, data) => {
      let BabelOutput = Babel.transform(data, {minified: true})
      if (BabelOutput.code) {
        log(`can't uglify file:`,name)
      } else {
        fs.outputFile(to, BabelOutput.code, err => {
          log(`uglifyed file: ${name}`)
        })
      }
    })
  }
}
