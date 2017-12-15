const MongoClient = require('mongodb').MongoClient
const colors = require('colors')

const x = exports
let db

MongoClient.connect(globconf.dburl, (err, dbase) => {
  if (err) {
    log('no mongodb database :(')
    process.exit()
  }
  db = dbase.db(globconf.dbname)

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

x.hello = () => {
  return "hello"
  // just a test
}
