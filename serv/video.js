// this is the main video file
// this file will compress, resize, make previews, cut and send all you'r video

// required packages
const fs = require('fs-extra')
const colors = require('colors')
const CryptoJS = require('crypto-js')
const sha1File = require('sha1-file')
const check = require('./check.js')
const fileinfo = require('fileinfo')
const path = require('path')

// database file
const dba = require('./database.js')

// error handeler
const errHandeler = require('./errorhandeler.js')

const x = exports


// TESTING...
let test = false

if (test) {
  // this will give erros if set to true, this is purly for testing

}
