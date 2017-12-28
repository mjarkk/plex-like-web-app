#!/usr/bin/node

// the actual server file

// required packages
const fs = require('fs-extra')
const aw = require('await-fs')
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

// replace console.log() with log()
global.log = console.log

// if there is no config file create it
if (!fs.existsSync('./conf/servconfig.json')) {
  fs.copySync('./conf/basic-conf.json', './conf/servconfig.json')
  log('created config file')
}
global.globconf = require('./conf/servconfig.json')

// gobal configs
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '/routes'))
app.use(express.static('./www/'))
app.use('/node', express.static('./node_modules/'))
app.use(bodyParser.json(true))
app.use(bodyParser.urlencoded({extended: true}))
app.use(compression({ threshold: 0 }))

// secure cookie config
if (!globconf.dev) {
  app.use(cookieParser(randomstring.generate(200)))
} else {
  app.use(cookieParser('a'))
}

// add all exstensions
fs.ensureDirSync('./www/js')
require('./serv/js.js')
fs.ensureDirSync('./www/style')
require('./serv/sass.js')
const dba = require('./serv/database.js')
const check = require('./serv/check.js')
const appdata = require('./serv/appdatahandeler.js')
const img = require('./serv/img.js')

// get all content from the css file
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

// get a index of all images to request
app.post('/imageindex/:index', (req, res) => {
  let tosend = {
    req: req,
    res: res,
    type: 'json',
    index: req.params.index
  }
  dba.checkuser(tosend, (UserData) => dba.getimglist(tosend, (ImageDataList) => {
    // user is logedin
    // if the user has not the writes the database itself will do a response
    // after that the database is asked for a list of the latest images
    res.json({
      status: true,
      data: dba.encrypt(ImageDataList,UserData.key)
    })
  }))
})

// return a image
let imagereturn = (tosend) => dba.checkuser(tosend, (UserData) => img.sendimg(tosend))
app.get('/image/:id/:quality/:resolution/:webpSuported', (req, res) => {
  let resolution = req.params.resolution
  let quality = req.params.quality
  let webp = req.params.webpSuported
  imagereturn({
    req: req,
    res: res,
    type: 'text',
    id: req.params.id,
    resolution: (resolution == '---' || resolution == 'false') ? undefined : resolution,
    quality: (quality == '---' || quality == 'false') ? undefined : quality,
    webp: (webp == 'true') ? true : false
  })
})

// a route to update the settings
app.post('/updatesettings/:what', (req, res) => dba.updatesettings(req,res))

// testing on the client if te server response
// this is used when the client is not shure if it has connection with the server or
// when it needs to wait until the server restarts
app.get('/ping',(req, res) => {
  res.send('pong')
})

// a route to get all the needed javascript files
app.get('*/basic.js', (req, res) => {
  if (req.path.indexOf('%2F') != -1 || req.path.indexOf('..') != -1) {
    res.send('"wrong url"')
  } else {
    const sendFilesList = []
    let urlcut = req.path.substring(req.path.search('/--') + 3, req.path.search('--/'))
    let urlarr = urlcut.split(".")
    for (var i = 0; i < urlarr.length; i++) {
      if (sendFilesList.indexOf(urlarr[i]) == -1) {
        sendFilesList.push(urlarr[i])
      }
    }
    let sendfiles = (files) => {
      res.set('Content-Type', 'application/javascript')
      let tosend = ''
      let addfile = (count) => {
        if (files[count]) {
          let FilePath = files[count].replace('/','')
          if (fs.existsSync(`./www/js/${FilePath}.js`)) {
            fs.readFile(`./www/js/${FilePath}.js`, 'utf8',(err, content) => {
              tosend += content
              addfile(count + 1)
            })
          } else {
            addfile(count + 1)
          }
        } else {
          res.send(tosend)
        }
      }
      addfile(0)
    }
    sendfiles(sendFilesList)
  }
})

// return html page
app.get('*', (req, res, next) => {
  if (check.checkofficalurl(req.path)) {
    if (req.signedCookies.logedin) {

      // user is logedin
      res.render('index', {
        jsfiles: ['main','home'],
        page: check.getpage(req.path)
      })

    } else {

      // user is not logedin
      res.render('index', {
        jsfiles: ['main','login'],
        page: 'login'
      })

    }
  } else {
    next()
  }
})

// if noting is found send a 404
app.get('*', (req, res) => {
  res.send('Error 404')
})

// a route for sending the settings config
app.post('/getsettings', (req, res) => {
  if (req.signedCookies.logedin && req.signedCookies.username) {
    fs.readJson('./conf/servconfig.json', (err, jsondata) => {
      dba.encryptjson({
        toencrypt: jsondata,
        username: req.signedCookies.username
      }, (data) => {
        res.json(data)
      })
    })
  } else {
    res.json({status: false})
  }
})

// a route to get a encrypted user key encrypted with an hashed password + salt from an user
app.post('/getsalt', (req, res) => {
  if (req.body.username) {
    const username = req.body.username
    dba.LoginStep({
      step: 1,
      username: username
    }, (data) => {
      res.json(data)
    })
  } else {
    res.json({status: false})
  }
})

// check if a user can login
app.post('/testlogin', (req, res) => {
  const b = req.body
  if (b.username && b.teststring) {
    dba.LoginStep({
      step: 2,
      username: b.username,
      teststring: b.teststring
    }, (data) => {
      if (data.status) {
        res.cookie('logedin', true, { signed: true })
        res.cookie('username', b.username, { signed: true })
        res.json({status: true})
      } else {
        res.json({status: false})
      }
    })
  } else {
    res.json({status: false})
  }
})

// start the server on given port
app.listen(globconf.port, () => log(`Server listening on port ${globconf.port}!`))
