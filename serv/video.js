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
  let input = `${ffmpeg} ${videodir}movie.mp4 `
  let p720 = `${input} `+
  `-bufsize 1000k -maxrate 1500k -b:v 1500k `+
  `-ac 2 -ab 256k -ar 48000 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  ` -vf "scale=-2:720" `+
  `./appdata/movies/public/movie720.mp4`
  let p540 = `${input} `+
  `-bufsize 500k -maxrate 800k -b:v 800k `+
  `-ac 2 -ab 128k -ar 44100 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  ` -vf "scale=-2:540" `+
  `./appdata/movies/public/movie540.mp4`
  let p360 = `${input} `+
  `-bufsize 400k -maxrate 400k -b:v 400k `+
  `-ac 2 -ab 64k -ar 22050 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  ` -vf "scale=-2:360" `+
  `./appdata/movies/public/movie360.mp4`

  let exec = (input, callback) => shell.exec(input, { async: true }, () => callback())

  // input is the oritinal file location relative from the root of this project OR from the root of the pc
  let MakeMP4 = (input, callback) => {
    if (fs.existsSync(input)) {
      let nextinput = `${videodir}movie.mp4`
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        Make720P(nextinput, callback)
      } else {
        // create a mp4 copy of the file
        exec(`${ffmpeg} ${input} ${nextinput}`, () => Make720P(nextinput, callback))
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }

  // the input is the ouput file from MakeMP4
  let Make720P = (input, callback) => {
    if (fs.existsSync(input)) {
      let nextinput = `${videodir}movie720.mp4`
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        Make540P(nextinput, callback)
      } else {
        // create a mp4 copy of the file
        // TODO: change the "p720" input
        exec(p720, () => Make540P(nextinput, callback))
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }
  let Make540P = (input, callback) => {
    if (fs.existsSync(input)) {
      let nextinput = `${videodir}movie540.mp4`
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        Make360P(input, callback)
      } else {
        // create a mp4 copy of the file
        // TODO: change the "p540" input
        exec(p540, () => Make360P(input, callback))
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }
  let Make360P = (input, callback) => {
    if (fs.existsSync(input)) {
      let nextinput = `${videodir}movie360.mp4`
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        CreateShakaPackage(input, callback)
      } else {
        // create a mp4 copy of the file
        // TODO: change the "p360" input
        exec(p360, () => CreateShakaPackage(input, callback))
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }
  let CreateShakaPackage = (input, callback) => {

  }

  MakeMP4(`${videodir}testmovie.mkv`, () => {})

}
