// this file writes errors to files

// required packages
const fs = require('fs-extra')

const errorpath = `./errors/`
const x = exports
const files = {
  database: errorpath + 'database.log',
  img: errorpath + 'img.log',
  js: errorpath + 'js.log',
  sass: errorpath + 'sass.log',
  serv: errorpath + 'serv.log'
}

// make shure the errors direcotry exsist
fs.ensureDirSync(errorpath)

let mkerr = (file, err) => {
  if (fs.existsSync(file)) {
    fs.appendFile(file, error, (output) => {

    })
  } else {
    fs.outputFile(file, error, (output) => {

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
