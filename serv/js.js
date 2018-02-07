const fs = require('fs-extra')
const watch = require('node-watch')
const UglifyJS = require('uglify-es')
const Babel = require('babel-core')

const x = exports

x.run = (callback) => {
  fs.readdir('./dev/js/', (err, items) => {
    let count = 0
    let errors = []
    for (let i = 0; i < items.length; i++) {
      let name = `./dev/js/${items[i]}`
      compile(name, (error) => {
        count = count + 1
        if (error) {
          errors.push(error)
        }
        if (count == items.length && typeof callback == 'function') {
          callback(errors)
        }
      })
    }
  })
}

// only automaticly start compiling when testing is off
if (!testingCode) {

  watch('./dev/js/', { recursive: true }, (evt, name) => {
    compile(name)
  })

  x.run()

  // copy the vue file to the www/js direcotry
  let vuefile = (globconf.dev) ? './node_modules/vue/dist/vue.js' : './node_modules/vue/dist/vue.min.js'
  fs.copy(vuefile, './www/js/vue.js', () => {
    log(`copied vue.js file`)
  })

}

let compile = (name, callback) => {
  let dune = (error) => {
    if (typeof callback == 'function') {
      if (!testingCode) {
        callback()
        if (error) {
          log(error)
        }
      } else {
        (error) ?
          callback(error) :
          callback()
      }
    } else if (error && !testingCode) {
      log(error)
    }
  }
  let to = name.replace('dev/','www/').replace('dev\\','www\\')
  if (globconf.dev) {
    // only copy the file to the www/js/ direcory this is better for debugging
    fs.copy(name, to, () => {
      if (!testingCode) {
        log(`copied js file from ${name} to ${to}`)
      }
      dune()
    })
  } else {
    // uglify the file and place in the www/js/ direcotry
    fs.readFile(name, 'utf8', (err, data) => {
      let BabelOutput = Babel.transform(data, {minified: true})
      if (BabelOutput.code) {
        dune(`can't uglify file:`,name)
      } else {
        fs.outputFile(to, BabelOutput.code, err => {
          if (!testingCode) {
            log(`uglifyed file: ${name}`)
          }
          dune()
        })
      }
    })
  }
}
