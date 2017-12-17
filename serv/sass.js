const fs = require('fs-extra')
const sass = require('npm-sass')
const watch = require('node-watch')

watch('./dev/style/', { recursive: true }, (evt, name) => {
  if (evt == 'update' && name.endsWith('.sass')) {
    sass('./' + name, { outputStyle: 'compressed' }, (err, result) => {
      if (!err) {
        log('compiled sass file: ' + result.stats.entry)
        fs.writeFile(result.stats.entry.replace('.sass','.css').replace('/dev/style/','/www/style/').replace('\\dev\\style\\','\\www\\style\\'),result.css)
      }
    })
  }
})
fs.readdir('./dev/style/', function(err, items) {
  for (let i = 0; i < items.length; i++) {
    let name = './dev/style/' + items[i]
    if (name.endsWith('.sass')) {
      sass('./' + name, { outputStyle: 'compressed' }, (err, result) => {
        if (!err) {
          log('compiled sass file: ' + items[i])
          fs.writeFile(result.stats.entry.replace('.sass','.css').replace('/dev/style/','/www/style/').replace('\\dev\\style\\','\\www\\style\\'),result.css)
        }
      })
    }
  }
})
