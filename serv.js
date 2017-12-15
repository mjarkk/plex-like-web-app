#!/usr/bin/node
const fs = require('fs-extra')
const aw = require('await-fs')
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
const officalroute = ['','/']

global.log = console.log
global.globconf = require('./conf/servconfig.json')

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/routes'))
app.use(express.static('./www/'))
app.use('/node', express.static('./node_modules/'))
app.use(bodyParser.json(true))
app.use(bodyParser.urlencoded({extended: true}))
app.use(compression({ threshold: 0 }))

if (globconf.dev) {
  app.use(cookieParser(randomstring.generate(200)))
} else {
  app.use(cookieParser('a'))
}

fs.ensureDirSync('./www/js')
require('./serv/js.js')
fs.ensureDirSync('./www/style')
require('./serv/sass.js')
const db = require('./serv/database.js')

console.log(db.hello())

if (!fs.existsSync('./conf/servconfig.json')) {
  fs.copySync('./conf/basic-conf.json', './conf/servconfig.json')
  log('created config file')
}

app.get('/style.css', (req, res) => fs.readdir('./www/style/', function(err, items) {
  res.set('Content-Type', 'text/css')
  let combinedfile = ''
  const addfiles = (count) => {
    let item = items[count]
    if (item) {
      fs.readFile('./www/style/' + item, 'utf8', (err, Content) => {
        combinedfile += Content
        addfiles(count + 1)
      })
    } else {
      res.send(combinedfile)
    }
  }
  addfiles(0)
}))

app.get('*/basic.js', (req, res) => {
  let sendfiles = (files) => {
    res.set('Content-Type', 'application/javascript')
    let tosend = ''
    let addfile = (count) => {
      if (files[count]) {
        fs.readFile(`./www/js/${files[count]}.js`, 'utf8',(err, content) => {
          tosend += content
          addfile(count + 1)
        })
      } else {
        res.send(tosend)
      }
    }
    addfile(0)
  }
  if (req.signedCookies.logedin) {
    sendfiles([])
  } else {
    sendfiles(['main','login'])
  }
})

app.get('*', (req, res, next) => {
  // res.cookie('logedin', true, { signed: true })
  if (officalroute.includes(req.path)) {
    if (req.signedCookies.logedin) {

      // user is logedin
      res.render('index', {
        jsfiles: ['main','login']
      })

    } else {
      res.render('index', {
        jsfiles: ['main','login']
      })
    }
  } else {
    next()
  }
})

app.get('*', (req, res) => {
  res.send('Error 404')
})

app.post('/getsalt', (req, res) => {
  const username = req.body.username

  res.json({
    status: false
  })
})

app.listen(globconf.port, () => log(`Server listening on port ${globconf.port}!`))

// db.collection("customers").insertOne({
//
// }, (err, dbres) => {
//
// })
