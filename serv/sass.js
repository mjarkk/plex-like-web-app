const fs = require('fs-extra')
const sass = require('npm-sass')
const watch = require('node-watch')

const x = exports

// error handeler
const errHandeler = require('./errorhandeler.js')

let fixPath = (input) => input.replace('.sass','.css').replace('/dev/style/','/www/style/').replace('\\dev\\style\\','\\www\\style\\')
let sassWrapper = (input, callback) => sass(`./${input}`, { outputStyle: 'compressed' }, callback)

x.run = (callback) => {

  let dune = (errors) => {
    if (typeof callback == 'function') {
      callback(errors)
    } else {
      if (testingCode) log(errors)
    }
  }

  fs.readdir('./dev/style/', (err, items) => {
    let errors = []
    let count =  0
    for (let i = 0; i < items.length; i++) {
      let name = './dev/style/' + items[i]
      if (name.endsWith('.sass')) {
        sassWrapper(name, (err, result) => {
          if (!err) {
            if (!testingCode) log('compiled sass file: ' + items[i])
            fs.writeFile(fixPath(result.stats.entry),result.css)
          } else {
            (!testingCode) ?
              errHandeler.SassErr(err):
              errors.push(err)
          }
          count = count + 1
          if (count == items.length) {
            dune(errors)
          }
        })
      }
    }
  })

}

if (!testingCode) {
  watch('./dev/style/', { recursive: true }, (evt, name) => {
    if (evt == 'update' && name.endsWith('.sass')) {
      sassWrapper(name, (err, result) => {
        if (!err) {
          log('compiled sass file: ' + result.stats.entry)
          fs.writeFile(fixPath(result.stats.entry),result.css)
        } else {
          errHandeler.SassErr(err)
        }
      })
    }
  })

  x.run()
}
