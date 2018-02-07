// this file writes errors to files

// required packages
const fs = require('fs-extra')
const path = require('path')

const errorpath = `../errors/`
const fullPath = (file) => path.resolve(__dirname, errorpath, file)
const x = exports

const files = {
  database: fullPath('database.log'),
  img: fullPath('img.log'),
  js: fullPath('js.log'),
  sass: fullPath('sass.log'),
  serv: fullPath('serv.log')
}

// make shure the errors direcotry exsist
fs.ensureDirSync(errorpath)

let mkerr = (file, err, callback) => {
  let dune = () => {
    if (typeof callback == 'function') {
      callback()
    }
  }
  if (fs.existsSync(file)) {
    fs.appendFile(file, err + '\n\n', (output) => {
      dune()
    })
  } else {
    fs.outputFile(file, err + '\n\n', (output) => {
      dune()
    })
  }
}

x.DatabaseErr = (error) => {
  mkerr(files.database, error)
}

x.ServErr = (error) => {
  mkerr(files.serv, error)
}

x.SassErr = (error) => {
  mkerr(files.sass, error)
}

x.JsErr = (error) => {
  mkerr(files.js, error)
}

x.ImgErr = (error) => {
  mkerr(files.img, error)
}
