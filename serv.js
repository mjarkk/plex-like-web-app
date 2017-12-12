const fs = require('fs-extra')
const colors = require('colors')
const express = require('express')
const cookieParser = require('cookie-parser')
const randomstring = require("randomstring")
const sha256 = require('sha256')
const bodyParser = require('body-parser')
const shell = require('shelljs')
const watch = require('node-watch')
const fetch = require('node-fetch')
const request = require('request')
const ejs = require('ejs')
const path = require('path')
const CryptoJS = require('crypto-js')
const moment = require('moment')
const MongoClient = require('mongodb').MongoClient
const app = express()

global.log = console.log

require('./serv/sass.js')
require('./serv/js.js')

if (!fs.existsSync('./conf/servconfig.json')) {
  fs.copySync('./conf/basic-conf.json', './conf/servconfig.json')
  log('created config file')
}
