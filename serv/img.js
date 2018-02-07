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
const path = require('path')

// database file
const dba = require('./database.js')

// error handeler
const errHandeler = require('./errorhandeler.js')

// image packages
const gm = require('gm').subClass({imageMagick: true})
const Jimp = require('jimp')
const webp = require('webp-converter')
const sizeOf = require('image-size')
const sharp = require('sharp')

const x = exports

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
    let BasicPath = `./appdata/images/public/`
    let imagetype = (fs.existsSync(`${BasicPath}${data.id}/image.png`)) ? 'png' : 'jpg'
    let MakeWebp = (status, quality) => webp.cwebp(`${BasicPath}${data.id}/image.${imagetype}`,`${BasicPath}${data.id}/image-${quality}.webp`,`-q ${quality}`,(output) => {
      if (quality == 90) {
        MakeWebp(status, 70)
      } else if (quality == 70) {
        MakeWebp(status, 50)
      } else if (quality == 50) {
        callback(status)
      }
    })
    if (typeof(data.location) == 'string' && typeof(data.id) == 'string') {
      fs.ensureDir(`${BasicPath}${data.id}/`, () => {
        Jimp.read(data.location, (err, image) => {
          image.write(`${BasicPath}${data.id}/image.jpg`)
          image.write(`${BasicPath}${data.id}/image.png`)
          image.quality(80).write(`${BasicPath}${data.id}/image-80.jpg`)
          image.quality(60).write(`${BasicPath}${data.id}/image-60.jpg`)
          MakeWebp({status: true}, 90)
        }).catch((err) => {
          errHandeler.ImgErr(err)
          MakeWebp(nope, 90)
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
    fileinfo(file).then((mime) => sizeOf(file, (err, dimensions) => {
      if (mime.type == 'image') {
        // log(file)
        let filetype = mime.mime
        if (filetype == 'image/png' || filetype == 'image/jpg' || filetype == 'image/gif') {
          // ask the database file for the image proviel or make a new one if it doesn't exsist
          dba.getfileindex({for: 'images', file: file, dimensions: dimensions}, (data) => {
            // check if there is already a image proviel
            if (data.status && (data.fromdb == undefined || (data.fromdb && !data.fromdb.imagejpg))) {
              let id = data.sha1
              convert.basic({id: id, location: file}, (status) => {
                if (status.status) {
                  fs.readdir(`./appdata/images/public/${id}/`, (err, ImageFiles) => {
                    if (err) {
                      errHandeler.ImgErr(err)
                      next()
                    } else {
                      // check if all the files are made by the server
                      let AvailableFiles = {
                        'image-50webp': false,
                        'image-70webp': false,
                        'image-90webp': false,
                        'image-60jpg': false,
                        'image-80jpg': false,
                        'imagejpg': false,
                        'imagepng': false
                      }
                      for (var i = 0; i < ImageFiles.length; i++) {
                        let imagefile = ImageFiles[i].replace(/\./g,'')
                        if (typeof(AvailableFiles[imagefile]) == 'boolean') {
                          AvailableFiles[imagefile] = true
                        }
                      }
                      try {
                        dba.updatefileindex({for: 'images', file: file, toadd: AvailableFiles}, (data) => {
                          next()
                        })
                      } catch (e) {
                        errHandeler.ImgErr(e)
                        next()
                      }
                    }
                  })
                } else {
                  // image failed to compile
                  next()
                }
              })
            } else {
              // server has already made proviel for the file
              next()
            }
          })
        } else {
          // can't handele file
          next()
        }
      } else {
        // file is not a image
        next()
      }
    }))
  } else {
    log('dune checking all images')
  }
}

// check if the database file is connected to the database
let checkdb = () => {
  dba.getfileindex ? dirloop(0) : setTimeout(() => checkdb(), 1000)
}

// only start compiling all images when this script is not required by a testing script
if (!testingCode) {
  checkdb()
}

// send a image to the user
// data = {
//   req: req,
//   res: res,
//   id: <string (sha1 of the image)>,
//   quality: <number (100, 90, 80, 70, 60, 50)> (not required),
//   resolution: <string (<width>x<height>)> (not required),
//   webp: <boolean>
// }
x.sendimg = (data) => {
  if (data.req && data.res && typeof(data.id) == 'string' && data.id != 'undefined' && data.id != 'NaN' && typeof(data.webp) == 'boolean') {
    let basicpath = `/appdata/images/public/${data.id}/`
    fs.readdir('.' + basicpath, (err, ImageFiles) => {

      let res = data.res

      // check with image i need to use
      let useimg = (ImageFiles.indexOf('image.png') > -1) ?
        path.join(__dirname, '..', basicpath, 'image.png') :
          (path.join(__dirname, '..', basicpath, 'image.jpg') > -1) ?
            path.join(__dirname, '..', basicpath, 'image.jpg') :
              undefined

      let SetQuality = () => {
        // check if the url includes a quality rule
        let quality = Number(data.quality)
        if (quality && quality >= 50 && quality <= 100) {
          if (quality == 100) {
            CutImg()
          } else {
            let option
            let type
            let check
            if (data.webp) {
              type = 'webp'
              check = [90,70,50]
            } else {
              type = 'jpg'
              check = [80,60]
            }
            for (var i = 0; i < check.length; i++) {
              if (ImageFiles.indexOf(`image-${check[i]}.${type}`) > -1 && (quality == check[i] || !option)) {
                option = check[i]
              }
            }
            if (option && type) {
              useimg = path.join(__dirname, '..', basicpath, `image-${option}.${type}`)
            }
            CutImg()
          }
        } else {
          CutImg()
        }
      }

      let CutImg = () => sizeOf(useimg, (err, dim) => {
        // set the resulution of the image smaller if the client has asked for it
        // if the aksed resolution is larger than the image it will send the size of the image
        if (data.resolution) {
          let x = data.resolution.indexOf('x')
          let width = Number(data.resolution.substr(0,x))
          width = (width > dim.width) ? dim.width : width

          let height = Number(data.resolution.substr(x + 1, data.resolution.lenght))
          height = (height > dim.height) ? dim.height : height

          sharp(useimg)
          .resize(width, height)
          .toBuffer()
          .then( data => SendImg(data) )
          .catch( err => SendImg())

        } else {
          SendImg()
        }
      })
      let SendImg = (buffer) => {
        // send the image
        res.set('Content-Type', 'image/' + path.extname(useimg).replace('.',''))
        if (buffer) {
          // send a image buffer to the user from the eddited image
          res.send(buffer)
          fs.writeFile(ReqPathSha1, buffer, (err) => (err) ? errHandeler.ImgErr(err) : true)
        } else {
          if (useimg) {
            // send the right file to the user
            res.sendFile(useimg)
            fs.copy(useimg, ReqPathSha1, err => (err) ? errHandeler.ImgErr(err) : true)
          } else {
            res.send('nope')
          }
        }
      }

      let ReqPathSha1 = `./cache/images/${CryptoJS.enc.Hex.stringify(CryptoJS.SHA1(`${data.id}${data.resolution}${data.quality}${data.webp}`))}`
      if (fs.existsSync(ReqPathSha1)) {
        // sendcached image to the user
        let sendurl = path.join(__dirname, '..', ReqPathSha1)
        res.sendFile(sendurl)
      } else {
        // image is never cached
        SetQuality()
      }
    })
  } else {
    // if the input data is wrong end the request so the server can go to the next one
    if (data && data.res) {
      data.res.end()
    }
  }
}

// send a spesific image to the user
// data = {
//   imgpath: <string (location of the image)>,
//   quality: <number (from 100 to 0 don't have to include this)>,
//   size: { <object (don't have to include this)>
//     height: <number>
//     width: <number>
//   }
//   req: req, <object (from a express.js post message)>
//   res: res, <object (from a express.js post message)>
// }
x.SendImgPath = (data) => {
  if (data && data.res && data.req && typeof data.imgpath == 'string' && fs.existsSync(data.imgpath)) {
    let res = data.res

    let SendImg = (buffer) => {
      res.set('Content-Type', 'image/' + path.extname(data.imgpath).replace('.',''))
      if (buffer) {
        // send a image buffer to the user from the eddited image
        res.send(buffer)
      } else {
        res.sendFile(data.imgpath)
      }
    }

    sharp(data.imgpath)
    .resize(
      (data.size && data.size.width) ?
        data.size.width :
        null,
      (data.size && data.size.height) ?
        data.size.height :
        null
    )
    .withMetadata()
    .jpeg({
      quality : (typeof data.quality == 'number' && data.quality >= 1  && data.quality <= 100) ?
        data.quality : // if the quality is include with the data object set the quality
        100 // if not set the quality to 100%
      ,
      force : false
    })
    .toBuffer()
    .then( data => SendImg(data) )
    .catch( err => SendImg())

  } else {
    if (data && data.res) {
      // if the input data is wrong end the request so the server can go to the next one
      data.res.end()
    }
  }
}
