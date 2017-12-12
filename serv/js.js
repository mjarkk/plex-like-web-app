const fs = require('fs-extra')
const watch = require('node-watch')
const UglifyJS = require("uglify-es")

watch('./dev/js/', { recursive: true }, (evt, name) => {
  let to = name.replace('dev/','www/')
  if (globconf.dev) {
    // only copy the file to the www/js/ direcory this is better for debugging
    fs.copy(name, to, () => {
      log(`copied js file from ${name} to ${to}`)
    })
  } else {
    // uglify the file and place in the www/js/ direcotry
    fs.readFile(file, 'utf8', (err, data) => {
      let r = UglifyJS.minify(data)
      if (r.error) {
        log(`can't uglify file:`,r.error)
      } else {
        fs.outputFile(to, r.code, err => {
          log(`uglifyed file: ${name}`)
        })
      }
    })
  }
});
