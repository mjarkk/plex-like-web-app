// the database file this is the file that handeles all the database request
// this file also handels encryption and decryption
// and it handels file handeling

// required packages
const MongoClient = require('mongodb').MongoClient
const colors = require('colors')
const fs = require('fs-extra')
const CryptoJS = require('crypto-js')
const pbkdf2 = require('pbkdf2-sha256')
const randomstring = require('randomstring')
const sha1File = require('sha1-file')
const questions = require('questions')
const path = require('path')
const movies = require('./movies.js')

const check = require('./check.js')
const globvars = {
  serverconf: './conf/servconfig.json'
}

// error handeler
const errHandeler = require('./errorhandeler.js')

// a variable for exporting
const x = exports
let database

// connect to the database
MongoClient.connect(globconf.dburl, (err, dbase) => {
  if (err) {
    log(`can't connect to database :(`, err)
    log(`try to change the data inside conf/servconfig.json`)
    process.exit()
  }
  database = dbase
  let db = dbase.db(globconf.dbname)

  // a function for creating all tabels that you will need
  let ensuredb = (arr, pos) => {
    if (pos == undefined) {
      pos = 0
    }
    if (arr[pos]) {
      db.createCollection(arr[pos],(err, res) => {
        if (err) {
          errHandeler.DatabaseErr(err)
          log(colors.red.bold('Cant create collection'))
          log(colors.red.bold('view errors/database.log for more information'))
          db.close()
          process.exit()
        } else {
          ensuredb(arr, pos + 1)
        }
      })
    } else if (!testingCode) {
      log(colors.green("Connected to database!"))
    }
  }
  // start checking/creating of the tables this function needs a array with all the tabel names
  ensuredb(['users','images','videos','checkencryption'])

  // check if all the data is made to start the server
  x.check = (callback) => setTimeout(() => {
    let count = db.collection('users').find().count()
    count.then(output => {
      if (output == 0) {
        callback({
          status: false,
          users: true
        })
      } else {
        callback({status: true})
      }
    })
  }, 100)

  // create user
  // data = {
  //   username: 'username',
  //   password: 'password',
  //   check: true // <-- check if the password is strong and valid (for devolopment it's handy to have no checking)
  // }
  x.createuser = (data, callback) => {
    if (data && typeof(data.username) == 'string' && typeof(data.password) == 'string' && typeof(data.check) == 'boolean') {
      // check if all the data is filled

      let salt = randomstring.generate(500)
      let todb = {
        salt: salt,
        password: CryptoJS.PBKDF2(data.password, salt, { keySize: 1000, iterations: 500 }).toString(),
        username: data.username,
        key: randomstring.generate(500)
      }

      let db = database.db(globconf.dbname)
      db.collection('users').insertOne(todb, (err, res) => {
        if (err) {
          callback({
            status: false,
            why: 'DB_Error'
          })
        } else {
          callback({
            status: true
          })
        }
      })

    } else {
      callback({
        status: false,
        why: 'Missing_Data'
      })
    }
  }

  // Update a video in the database and download/make new files if that is neededs
  // data = {
  //   req: <req from a post/get message>,
  //   res: <res from a post/get message>,
  //   id: <string (movie id/sha1)>
  // }
  x.UpdateVideoProviel = (data, callback) => {

    // dune is a wrapper for the callback because sometimes the code will..
    // send 2 times a callback that will result in a error with express.js
    // also the callback might not be defined so check if it's defined
    let AlreadyDune = false
    dune = (callbackdata) => {
      if (!AlreadyDune && typeof callback == 'function') {
        callback(callbackdata)
        AlreadyDune = true
      }
    }

    checkencryptionHolder = () =>
      checkencryption(data.req.body.tochange)
        .then(encryptstatus => {
          if (encryptstatus) {
            DecryptUserData({
              username: data.req.signedCookies.username,
              decrypt: data.req.body.tochange
            }, handelData)
          } else {
            dune(nope)
          }
        })

    handelData = (DecryptedData) => {
      if (DecryptedData.status) {
        let tochange = DecryptedData.data
        if (tochange.TheMovieDbId) {
          // TODO: fetch the movie poster from the moviedb
        }
        db.collection('videos').updateOne(
          { id: tochange.id },
          { "$set": tochange },
          {new: true, upsert: true},
          (err, doc) => {
            dune(tochange)
          }
        )
      } else {
        dune(nope)
      }
    }

    if (data && data.req && data.res && typeof data.id == 'string') {
      checkencryptionHolder()
    } else {
      dune(nope)
    }
  }

  // create a database entery for a specifice video file
  // data = {
  //   original: <string (the original file location)>,
  //   dir: <string (the appdata location for the videos)>,
  //   files: {
  //     preview: <boolean (a check if a list of images exsist for every view seconds)>,
  //     poster: <boolean (post of the movie this might be a picture from the interet or a screenshot from somewhere in the movie)>,
  //     mpd: <boolean (if video.mpd exsist)>,
  //     shakaCreated: <boolean (if video.mpd exsist)>,
  //     shakaVideo: <boolean (if shaka-movie_video.mp4 exsist)>,
  //     shakaAudio: <boolean (if shaka-movie_audio.mp4 exsist)>,
  //     shakaVideo360: <boolean (if shaka-movie360_video.mp4 exsist)>,
  //     shakaAudio360: <boolean (if shaka-movie360_audio.mp4 exsist)>,
  //     shakaVideo540: <boolean (if shaka-movie540_video.mp4 exsist)>,
  //     shakaAudio540: <boolean (if shaka-movie540_audio.mp4 exsist)>,
  //     shakaVideo720: <boolean (if shaka-movie720_video.mp4 exsist)>,
  //     shakaAudio720: <boolean (if shaka-movie720_audio.mp4 exsist)>
  //   }
  // }
  x.CreateVideoProviel = (data, callback) => {
    let todb = Object.assign(
      {},{
        id: data.dir.substring(data.dir.length,data.dir.length-40), // the sha of the movie
        moviename: path.parse(data.original).name, // the name of the movie
        background: '', // a background image for the movie info screen
        belongs: { // this object contains all info if the movie is relavant to a serie or title
          name: '',
          poster: ''
        }, // a name of a serie
        show: true // show the movie on the website
      },data
    )
    let createproviel = () => {
      // insert data into database
      db.collection('videos').insertOne(todb, (err, res) => {
        if (err) {
          Call({status: false})
        } else {
          Call({status: true})
        }
      })
    }
    let Call = (data) =>
      (typeof callback == 'function') ?
        callback(data) :
        false // do noting if callback is not a function
    if (
      typeof data.original == 'string' &&
      typeof data.dir == 'string' &&
      typeof data.files == 'object' &&
      typeof data.files.preview == 'boolean' &&
      typeof data.files.poster == 'boolean' &&
      typeof data.files.mpd == 'boolean' &&
      typeof data.files.shakaCreated == 'boolean' &&
      typeof data.files.shakaVideo == 'boolean' &&
      typeof data.files.shakaAudio == 'boolean' &&
      typeof data.files.shakaVideo360 == 'boolean' &&
      typeof data.files.shakaAudio360 == 'boolean' &&
      typeof data.files.shakaVideo540 == 'boolean' &&
      typeof data.files.shakaAudio540 == 'boolean' &&
      typeof data.files.shakaVideo720 == 'boolean' &&
      typeof data.files.shakaAudio720 == 'boolean'
    ) {
      // data object is valid
      db.collection('videos').find({dir: data.dir}).toArray((err, result) => {
        if (err || !result[0]) {
          // no video proviel does exsist of this folder
          createproviel()
        } else {
          // video proviel already exsist
          Call({status: true})
        }
      })
    } else {
      Call({status: false})
    }
  }

  // get a list of all video files
  // data = {
  //   req: req, <object (from a express.js post message)>
  //   res: res <object (from a express.js post message)>
  // }
  x.getvideolist = (data, callback) => {
    if (data && typeof callback == 'function' && data.req && data.res) {
      db.collection('videos')
      .find()
      .toArray((err, result) => {
        let tosend = []
        for (var i = 0; i < result.length; i++) {
          let re = result[i]
          let topush = []
          topush.push(re.id)
          topush.push(re.moviename)
          topush.push((re.show && re.files.shakaVideo && re.files.shakaAudio && re.files.mpd))
          topush.push(re.files.poster)
          topush.push(re.background)
          topush.push(re.belongs.name)
          topush.push(re.belongs.poster)
          tosend.push(topush)

        }
        // tosend = [
        //   < id >,
        //   < movie name >,
        //   < show movie >,
        //   < movie poster >,
        //   < movie background image >,
        //   < name of relavate serie or something else >,
        //   < poster of relevate serie or something else >
        // ]
        callback(tosend)
      })
    } else {
      callback(nope)
    }
  }

  // get a list of images
  // data = {
  //   req: req, <object (from a express.js post message)>
  //   res: res, <object (from a express.js post message)>
  //   index: <string OR number>
  //   amound: <number>
  // }
  x.getimglist = (data, callback) => {
    if (typeof(callback) == 'function' && data.amound && data.req && data.res && (typeof(data.index) == 'number' || typeof(data.index) == 'string')) {
      let requestamount = data.amound
      db.collection('images')
      .find()
      .sort({ birthtimenumber: -1 })
      .limit(requestamount)
      .skip(requestamount * Number(data.index))
      .toArray((err, result) => {
        let callbackData = []
        for (var i = 0; i < result.length; i++) {
          let r = result[i]
          // compress the output data from the database to make the total browser cost smaller
          let ToSend = [r.birthtimenumber,r.sha1]
          if (r.dimensions && r.dimensions.width && r.dimensions.height) {
            ToSend.push(r.dimensions.width, r.dimensions.height)
          }
          callbackData.push(ToSend)
        }
        callback(callbackData)
      })
    } else {
      callback(nope)
    }
  }

  // check if user is logedin
  // data = {
  //   req: req,
  //   res: res,
  //   type: <string (json OR text)>
  // }
  x.checkuser = (data, callback) => {
    // TODO: cache the data from database for faster callback this would be much faster if there are a lot of users
    if (data.req && data.res && (data.type == 'json' || data.type == 'text') && typeof(callback) == 'function' && data.req.signedCookies.logedin && data.req.signedCookies.username) {
      db.collection("users").find({username: {$in:[data.req.signedCookies.username]}}).toArray((err, result) => {
        if (err || !result[0]) {
          if (data.type == 'json') {
            data.res.json(nope)
          } else {
            data.res.send('nope')
          }
        } else {
          callback(result[0])
        }
      })
    } else if (data.res && typeof(data.res.send) == 'function') {
      data.res.send('nope')
    }
  }

  // encrypt some json data
  // data = {
  //   toencrypt: {/* json opbject */} OR [/* array */]
  //   username: 'username'
  // }
  x.encryptjson = (data, callback) => {
    if (data && typeof(data.toencrypt) == 'object' && typeof(data.username) == 'string') {
      let db = database.db(globconf.dbname)
      db.collection("users").find({username: {$in:[data.username]}}).toArray((err, result) => {
        if (err || !result[0]) {
          callback({status: false})
        } else {
          callback({
            status: true,
            data: x.encrypt(data.toencrypt, result[0].key)
          })
        }
      })
    } else {
      callback({status: false})
    }
  }

  // update settings route redirected from /updatesettings/{{ whatever }}
  x.updatesettings = (req, res) => checkencryption(req.body.tochange).then((encryptstatus) => {
    if (req.signedCookies.logedin && req.signedCookies.username && req.body.tochange && encryptstatus) {
      switch(req.params.what) {
        case 'basic':
          // change the core server config
          DecryptUserData({
            username: req.signedCookies.username,
            decrypt: req.body.tochange
          }, (data) => {
            try {
              if (data.status) {
                fs.readJson(globvars.serverconf, (err, config) => {
                  let compaire = data.data
                  let needserverrestart = false
                  let returnerr = []
                  if (typeof(config.port) == typeof(Number(compaire.port))) {
                    config.port = Number(compaire.port)
                    needserverrestart = true
                  }

                  if (typeof(config.dev) == typeof(compaire.dev)) {
                    config.dev = compaire.dev
                    needserverrestart = true
                  }
                  if (typeof(config.imagedirs) == typeof(compaire.imagedirs) && compaire.imagedirs[0]) {
                    if (check.CheckDirEx(compaire.imagedirs[0])) {
                      config.imagedirs = compaire.imagedirs
                      needserverrestart = true
                    } else {
                      returnerr.push({
                        for: 'imagedirs',
                        what: 'direcotry does not exsist'
                      })
                    }
                  } else if (typeof(config.imagedirs) == typeof(compaire.imagedirs) && !compaire.imagedirs[0]) {
                    config.imagedirs = compaire.imagedirs
                  }
                  if (typeof(config.moviedirs) == typeof(compaire.moviedirs) && compaire.moviedirs[0]) {
                    if (check.CheckDirEx(compaire.moviedirs[0])) {
                      config.moviedirs = compaire.moviedirs
                      needserverrestart = true
                    } else {
                      returnerr.push({
                        for: 'moviedirs',
                        what: 'direcotry does not exsist'
                      })
                    }
                  } else if (typeof(config.moviedirs) == typeof(compaire.moviedirs) && !compaire.moviedirs[0]) {
                    config.moviedirs = compaire.moviedirs
                  }
                  if (typeof(config.musicdirs) == typeof(compaire.musicdirs) && compaire.musicdirs[0]) {
                    if (check.CheckDirEx(compaire.musicdirs[0])) {
                      config.musicdirs = compaire.musicdirs
                      needserverrestart = true
                    } else {
                      returnerr.push({
                        for: 'musicdirs',
                        what: 'direcotry does not exsist'
                      })
                    }
                  } else if (typeof(config.musicdirs) == typeof(compaire.musicdirs) && !compaire.musicdirs[0]) {
                    config.musicdirs = compaire.musicdirs
                  }
                  fs.outputJson(globvars.serverconf, config, {spaces: 2}, err => {
                    if (needserverrestart && !globconf.dev) {
                      setTimeout(() => {
                        process.exit()
                      }, 1000)
                    }
                  })
                  res.json({
                    status: true,
                    errors: returnerr
                  })
                })
              } else {
                res.json(nope)
              }
            } catch (e) {
              res.json(nope)
            }
          })
          break;
        case 'somethingelse':
          res.json({status: true})
          break;
        default:
          res.json(nope)
      }
    } else {
      res.json(nope)
    }
  })

  // update file information
  // {
  //   for: <string (images, movies OR music)>,
  //   file: <string (location of the file)>,
  //   toadd: {
  //     <string (name of the converted file)>: <boolean>
  //   }
  // }
  x.updatefileindex = (data, callback) => {
    let check = (
      typeof(data.for) == 'string' &&
      (data.for == 'images' || data.for == 'movies' || data.for == 'music') &&
      typeof(data.file) == 'string' &&
      typeof(data.toadd) == 'object') &&
      typeof(callback) == 'function'
    if (check) {
      if (data.for == 'images') {
        db.collection(data.for).updateOne(
          { filename: data.file },
          { "$set": data.toadd },
          {new: true, upsert: true},
          (err, doc) => {
            callback({status: true})
          }
        )
      } else {
        // other files types not supported yet :(
        callback(nope)
      }
    } else {
      (typeof(callback) == 'function') ? callback(nope) : log('no callback for updatefileindex')
      return false
    }
  }

  // returns a unique id for a new file
  // data = {
  //    for: <string (images, movies OR music)>,
  //    file: <string (location of the file)>,
  //    dimensions: <object (only when using images)>
  // }
  x.getfileindex = (data, callback) => {
    let check = (
      typeof(data.for) == 'string' &&
      (data.for == 'images' || data.for == 'movies' || data.for == 'music') &&
      typeof(data.file) == 'string' &&
      typeof(data.dimensions) == 'object' &&
      callback )
    if (check) {
      fs.stat(data.file, (er, stat) => {
        if (er) {
          callback(nope)
        } else {
          let todb = {
            filename: data.file,
            sha1: sha1File(data.file),
            birthtime: stat.birthtime,
            birthtimenumber: (new Date(stat.birthtime).getTime())
          }
          if (data.for == 'images' && data.dimensions) {
            todb['dimensions'] = data.dimensions
          }
          db.collection(data.for).find({filename: {$in:[data.file]}}).toArray((err, result) => {
            // check if the database has already an entery for the file
            if (err || !result[0]) {
              db.collection(data.for).insertOne(todb, (err, res) => {
                if (err) {
                  callback(nope)
                } else {
                  callback({
                    status: true,
                    sha1: todb.sha1,
                    alreadyExists: false,
                    fromdb: result[0]
                  })
                }
              })
            } else {
              // TODO: need to overwrite the old value if the hash is divrent and delete the old image the libary
              callback({
                status: true,
                sha1: todb.sha1,
                alreadyExists: true,
                fromdb: result[0]
              })
            }
          })
        }
      })
    } else {
      callback(nope)
    }
  }

  // process of Login
  // step 1:
  // data = {
  //   step: 1,
  //   username: 'username'
  // }
  // step 2:
  // data = {
  //    step: 2,
  //    teststring: 'teststring',
  //    username: 'username'
  // }
  x.LoginStep = (data, callback) => {
    if (data && typeof(data.step) == 'number') {
      let step = data.step
      let db = database.db(globconf.dbname)
      if (data.step == 1) {
        if (typeof(data.username) == 'string') {
          let username = data.username
          db.collection("users").find({username: {$in:[username]}}).toArray((err, result) => {
            if (err || !result[0]) {
              callback({
                status: false,
                why: 'User_not_found'
              })
            } else {
              callback({
                status: true,
                salt: result[0].salt,
                key: x.encrypt(result[0].key, result[0].password)
              })
            }
          })
        } else {
          callback({
            status: false,
            why: 'Username_not_defined'
          })
        }
      } else if (data.step == 2) {
        if (typeof(data.username) == 'string' && typeof(data.teststring) == 'string') {
          let username = data.username
          db.collection("users").find({username: {$in:[username]}}).toArray((err, result) => {
            if (err || !result[0]) {
              callback({
                status: false,
                why: 'User_not_found'
              })
            } else {
              x.decrypt(data.teststring, result[0].password + result[0].salt, (res) => {
                if (res) {
                  callback({
                    status: true
                  })
                } else {
                  callback(nope)
                }
              })
            }
          })
        } else {
          callback({
            status: false,
            why: 'Username_not_defined'
          })
        }
      }
    } else {
      callback({
        status: false,
        why: 'Step_not_defined'
      })
    }
  }

  // check if a string is used earlier
  // this prevends not allowed users from sending a url to the server
  // tocheck = <string>
  let checkencryption = async (tocheck) => {
    if (tocheck) {
      checkkey = (key) => {
        return new Promise(resolve => {
          db.collection('checkencryption').find({key: key}).toArray((err, result) => {
            resolve(result)
          })
        })
      }
      createkey = (key) => {
        return new Promise(resolve => {
          db.collection('checkencryption').insertOne({key: key}, (err, res) => {
            resolve(res)
          })
        })
      }
      let dboutput = await checkkey(tocheck)
      if (dboutput[0] && dboutput[0].key == tocheck) {
        log('Blocked request with a already used key')
        return false
      } else {
        let createstatus = await createkey(tocheck)
        return true
      }
    } else {
      log('Blocked request with a already used key')
      return false
    }
  }

  // decrypt a sended string from a user
  //  data = {
  //    username: <string (username of a username)>,
  //    decrypt: <string (a decrypted string)>
  //  }
  //  callback = {
  //    status: <boolean>,
  //    data: <object OR string>
  //  }
  let DecryptUserData = (data, callback) => {
    if (typeof(data.username) == 'string' && typeof(data.decrypt) == 'string') {
      db.collection("users").find({username: {$in:[data.username]}}).toArray((err, result) => {
        if (err || !result[0]) {
          callback(nope)
        } else {
          x.decrypt(data.decrypt, result[0].key, (data) => {
            if (!data) {
              callback(nope)
            } else {
              try {
                callback({
                  status: true,
                  data: JSON.parse(data)
                })
              } catch (e) {
                callback({
                  status: true,
                  data: data
                })
              }
            }
          })
        }
      })
    } else {
      callback({status: false})
    }
  }

  x.removeImageJunk = (callback) => {
    let requestamount = 50
    let loop = (index) => {
      db.collection('images')
      .find()
      .limit(requestamount)
      .skip(requestamount * index)
      .toArray((err, results) => {
        let dune = () => {
          if (results.length == requestamount) {
            // go the next row of images when the length of the results is the same as `requestamount`
            loop(index + 1)
          } else if (typeof callback == 'function') {
            callback({status: true})
          }
        }
        let resultsLoop = (i) => {
          let item = results[i]
          if (item) {
            if (fs.existsSync(item.filename)) {
              resultsLoop(i + 1)
            } else {
              db.collection('images')
              .remove({filename: {$in:[item.filename]}}, (err) => {
                resultsLoop(i + 1)
              })
            }
          } else {
            dune()
          }
        }
        resultsLoop(0)
      })
    }
    loop(0)
  }

  // encrypt function
  x.encrypt = (ToEncrypt,key) => {
    if (typeof(ToEncrypt) == 'object') {
      return(CryptoJS.AES.encrypt(JSON.stringify(ToEncrypt), key).toString())
    } else {
      return(CryptoJS.AES.encrypt(ToEncrypt, key).toString())
    }
  }

  // decrypt function
  x.decrypt = (data, key, callback) => {
    try {
      let decrypted = CryptoJS.AES.decrypt(data,key).toString(CryptoJS.enc.Utf8)
      callback(decrypted)
    } catch (e) {
      callback(false)
    }
  }

  // the nope response
  const nope = {status: false}

})
