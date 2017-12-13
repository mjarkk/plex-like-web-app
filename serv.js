#!/usr/bin/node
const fs = require('fs-extra')
const gm = require('gm').subClass({imageMagick: true})
const colors = require('colors')
const express = require('express')
const cookieParser = require('cookie-parser')
const randomstring = require('randomstring')
const sha256 = require('sha256')
const bodyParser = require('body-parser')
const shell = require('shelljs')
const watch = require('node-watch')
const fetch = require('node-fetch')
const compression = require('compression')
const request = require('request')
const ejs = require('ejs')
const path = require('path')
const CryptoJS = require('crypto-js')
const moment = require('moment')
const MongoClient = require('mongodb').MongoClient
const app = express()

global.log = console.log
global.globconf = require('./conf/servconfig.json')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/routes'))
app.use(express.static('./www/'))
app.use('/node', express.static('./node_modules/'))
app.use(bodyParser.json(true))
app.use(bodyParser.urlencoded({extended: true}))
app.use(compression({ threshold: 0 }))

fs.ensureDirSync(dir)
if (globconf.dev) {
  app.use(cookieParser(randomstring.generate(100)))
} else {
  app.use(cookieParser('a'))
}

fs.ensureDirSync('./www/js')
require('./serv/js.js')
fs.ensureDirSync('./www/style')
require('./serv/sass.js')

if (!fs.existsSync('./conf/servconfig.json')) {
  fs.copySync('./conf/basic-conf.json', './conf/servconfig.json')
  log('created config file')
}
MongoClient.connect(globconf.dburl, (err, dbase) => {
  if (err) {
    log('no mongodb database :(')
    process.exit()
  }
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

  app.get('*', (req, res) => {
    res.render('index', {

    })
  })

})

app.listen(globconf.port, () => log(`Server listening on port ${globconf.port}!`))
