// this file is for all the image things
// - optimaliation (converting them into webp, jpeg, gif and changing the resolution)
// - metedata (get all meta data from the image and place it in a sepret file)
// - preloading (bundele and optimize images before is's requested)

// required packages
const fs = require('fs-extra')
const colors = require('colors')
const CryptoJS = require('crypto-js')
const pbkdf2 = require('pbkdf2-sha256')
const check = require('./check.js')
const fileinfo = require('fileinfo')

// database file
const dba = require('./database.js')

// error handeler
const errHandeler = require('./errorhandeler.js')

// image packages
const gm = require('gm').subClass({imageMagick: true})
const Jimp = require('jimp')
const webp = require('webp-converter')

let dirstocheck = []
let filestocheck = []

// add public dires to dirstocheck
for (var i = 0; i < globconf.imagedirs.length; i++) {
  dirstocheck.push(globconf.imagedirs[i])
}

// convertion
let convert = {
  // convert.basic <function (this only works with jpg and png inputs)>
  //data = {
  //  location: <string (the location of the jpg image)>,
  //  id: <string (the sha of the original image this will be used to find the wright folder to place the image)>
  //}
  basic: (data, callback) => {
    if (typeof(data.location) == 'string' && typeof(data.id) == 'string') {
      fs.ensureDir(`./appdata/images/public/${data.id}/`, () => {
        Jimp.read(data.location, (err, image) => {
          image.write(`./appdata/images/public/${data.id}/image.jpg`)
          image.write(`./appdata/images/public/${data.id}/image.png`)
          image.quality(80).write(`./appdata/images/public/${data.id}/image-80.jpg`)
          image.quality(60).write(`./appdata/images/public/${data.id}/image-60.jpg`)
          callback({status: true})
        }).catch((err) => {
          errHandeler.ImgErr(err)
          callback(nope)
        })
      })
    } else {
      callback(nope)
    }
  }
}

// a function for creating a index with all files in direcotrys
let dirloop = (index) => {
  const dir = dirstocheck[index]
  if (typeof(dir) == 'string') {
    fs.readdir(dir, (err, files) => {
      for (file of files) {
        let FullPath = `${dir}/${file}`
        let FileStats = fs.lstatSync(FullPath)
        if (FileStats.isDirectory()) {
          dirstocheck.push(FullPath)
        } else {
          filestocheck.push(FullPath)
        }
      }
      dirloop(index + 1)
    })
  } else {
    filesloop(0)
  }
}

// a function for working with images
let filesloop = (index) => {
  const file = filestocheck[index]
  let next = () => {
    filesloop(index + 1)
  }
  if (file) {
    // get file info to determen how we need to handel the file
    fileinfo(file).then((mime) => {
      if (mime.type == 'image') {
        // log(file)
        switch (mime.mime) {
          case 'image/png':
            dba.getfileindex({for: 'images', file: file}, (data) => {
              // check if image already exsist
              if (data.alreadyExists && data.status) {
                convert.basic({id: data.sha1, location: file}, (status) => {
                  next()
                })
              } else {
                next()
              }
            })
            break;
          case 'image/jpg':
            dba.getfileindex({for: 'images', file: file}, (data) => {
              // check if image already exsist
              if (data.alreadyExists && data.status) {
                convert.basic({id: data.sha1, location: file}, (status) => {
                  next()
                })
              } else {
                next()
              }
            })
            break;
          case 'image/gif':
            dba.getfileindex({for: 'images', file: file}, (data) => {
              // check if image already exsist
              if (data.alreadyExists) {
                next()
              } else {
                next()
              }
            })
            break;
          default:
            // can't handele file
            next()
        }
      } else {
        // file is not a image
        next()
      }
    })
  }
}

// check if the database file is connected to the database
let checkdb = () => {
  (dba.getfileindex) ? dirloop(0) : setTimeout(() => checkdb(), 1000)
}
checkdb()
