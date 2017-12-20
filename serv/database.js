const MongoClient = require('mongodb').MongoClient
const colors = require('colors')
const fs = require('fs-extra')
const CryptoJS = require('crypto-js')
const pbkdf2 = require('pbkdf2-sha256')
const randomstring = require('randomstring')
const check = require('./check.js')
const globvars = {
  serverconf: './conf/servconfig.json'
}

const x = exports
let database

MongoClient.connect(globconf.dburl, (err, dbase) => {
  if (err) {
    log(err)
    log('no mongodb database :(')
    process.exit()
  }
  database = dbase
  let db = dbase.db(globconf.dbname)

  let ensuredb = (arr, pos) => {
    if (arr[pos]) {
      db.createCollection(arr[pos],(err, res) => {
        if (err) {
          log(colors.red.bold('Cant create collection'))
          db.close()
          process.exit()
        } else {
          ensuredb(arr, pos + 1)
        }
      })
    } else {
      log(colors.green("Connected to database!"))
    }
  }
  ensuredb(['users'],0)




  // create user
  // data = {
  //   username: 'username',
  //   password: 'password',
  //   check: true // <-- check if the password is strong and valid
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
            data: encrypt(data.toencrypt, result[0].key)
          })
        }
      })
    } else {
      callback({status: false})
    }
  }

  // update settings route redirected from /updatesettings/{{ whatever }}
  x.updatesettings = (req, res) => {
    if (req.signedCookies.logedin && req.signedCookies.username && req.body.tochange) {
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
                key: encrypt(result[0].key, result[0].password)
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
              decrypt(data.teststring, result[0].password + result[0].salt, (res) => {
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
          decrypt(data.decrypt, result[0].key, (data) => {
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

  // encrypt function
  let encrypt = (ToEncrypt,key) => {
    if (typeof(ToEncrypt) == 'object') {
      return(CryptoJS.AES.encrypt(JSON.stringify(ToEncrypt), key).toString())
    } else {
      return(CryptoJS.AES.encrypt(ToEncrypt, key).toString())
    }
  }

  // decrypt function
  let decrypt = (data, key, callback) => {
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
