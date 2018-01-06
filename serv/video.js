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
const shell = require('shelljs')

// database file
const dba = require('./database.js')

// error handeler
const errHandeler = require('./errorhandeler.js')

const x = exports
const videodir = `./appdata/movies/public/`
const ffmpeg = `ffmpeg -y -i`

// TESTING...
let test = false

if (test) {
  // this will give erros if set to true, this is purly for testing
  // shell.exec(`${ffmpeg} ${videodir}testmovie.mkv ${videodir}movie.mp4`, {async: true}, () => {
  //
  // })
  let p720 = `${ffmpeg} `+
  `${videodir}movie.mp4 `+
  `-bufsize 1000k -maxrate 1500k -b:v 1500k `+
  `-ac 2 -ab 256k -ar 48000 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  `./appdata/movies/public/movie720.mp4`
  log(p720)
  // shell.exec(p720, {async: true}, () => {
  //
  // })
}
