const MongoClient = require('mongodb').MongoClient
const colors = require('colors')
const CryptoJS = require('crypto-js')
const pbkdf2 = require('pbkdf2-sha256')
const randomstring = require('randomstring')

const x = exports
let database

MongoClient.connect(globconf.dburl, (err, dbase) => {
  if (err) {
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

})


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
            decrypt(data.teststring, result[0].password, (res) => {
              if (res) {
                callback({
                  status: true
                })
              } else {
                callback({
                  status: false
                })
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

let encrypt = (ToEncrypt,key) => {
  if (typeof(ToEncrypt) == 'object') {
    return(CryptoJS.AES.encrypt(JSON.stringify(ToEncrypt), key).toString())
  } else {
    return(CryptoJS.AES.encrypt(ToEncrypt, key).toString())
  }
}

let decrypt = (data, key, callback) => {
  try {
    let decrypted = CryptoJS.AES.decrypt(data,key).toString(CryptoJS.enc.Utf8)
    callback(decrypted)
  } catch (e) {
    callback(false)
  }
}
