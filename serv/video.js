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
const os = require('os')

// database file
const dba = require('./database.js')

// error handeler
const errHandeler = require('./errorhandeler.js')

const x = exports
const ffmpeg = `ffmpeg -y -i`

// TESTING...
let test = false

if (test) {
  // this will give erros if set to true, this is purly for testing
  const videodir = `./appdata/movies/public/`
  // input is a basic input
  let input = `${ffmpeg} ${videodir}movie.mp4 `
  let p720 = (from, to) => `${ffmpeg} ${from} `+
  `-bufsize 1000k -maxrate 1500k -b:v 1500k `+
  `-ac 2 -ab 256k -ar 48000 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  ` -vf "scale=-2:720" ${to}`
  let p540 = (from, to) => `${ffmpeg} ${from} `+
  `-bufsize 500k -maxrate 800k -b:v 800k `+
  `-ac 2 -ab 128k -ar 44100 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  ` -vf "scale=-2:540" ${to}`
  let p360 = (from, to) => `${ffmpeg} ${from} `+
  `-bufsize 400k -maxrate 400k -b:v 400k `+
  `-ac 2 -ab 64k -ar 22050 -c:v libx264 ` +
  `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
  ` -vf "scale=-2:360" ${to}`

  let exec = (input, callback) => shell.exec(input, { async: true }, () => callback())
  // let exec = (input, callback) => {
  //   log('exec funtion fired,', input)
  //   callback()
  // }

  // input is the oritinal file location relative from the root of this project OR from the root of the pc
  let MakeMP4 = (input, callback) => {
    let next = () => Make720P(nextinput, callback)
    let nextinput = `${videodir}movie.mp4`
    if (fs.existsSync(input)) {
      if (fs.existsSync(path.resolve(nextinput))) {
        // a movie file of the image does already exsist skip this step
        next()
      } else {
        // create a mp4 copy of the file
        exec(`${ffmpeg} ${input} ${nextinput}`, () => next())
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }

  // the input is the ouput file from MakeMP4
  let Make720P = (input, callback) => {
    let nextinput = `${videodir}movie720.mp4`
    let next = () => Make540P(nextinput, callback)
    if (fs.existsSync(input)) {
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        next()
      } else {
        // create a mp4 copy of the file
        exec(p720(input,nextinput), () => next())
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }
  let Make540P = (input, callback) => {
    let nextinput = `${videodir}movie540.mp4`
    let next = () => Make360P(input, callback)
    if (fs.existsSync(input)) {
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        next()
      } else {
        // create a mp4 copy of the file
        exec(p540(input,nextinput), () => next())
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }
  let Make360P = (input, callback) => {
    let next = () => CreateShakaPackage(input, callback)
    let nextinput = `${videodir}movie360.mp4`
    if (fs.existsSync(input)) {
      if (fs.existsSync(nextinput)) {
        // a movie file of the image does already exsist skip this step
        next()
      } else {
        // create a mp4 copy of the file
        // TODO: change the "p360" input
        exec(p360(input,nextinput), () => next())
      }
    } else {
      log('input file does not exsist')
      callback({status: false})
    }
  }
  let CreateShakaPackage = (input, callback) => {
    let dir = path.parse(input).dir + '/'
    let next = () => cleanup(dir, callback)
    let checkp = (input) => fs.existsSync(path.resolve(__dirname,'..',`${dir}${input}`))
    let oss = os.platform()
    let command = `./dev/shaka-packager/`+
    `${(oss == 'win32') ? 'windows.exe' : (oss == 'darwin') ? 'macos' : 'linux' } ` + // check witch program it needs to use
    checkp(`movie.mp4`) ? `input=${dir}movie.mp4,stream=audio,output=${dir}shaka-movie_audio.mp4 ` : '' + // the original (mp4 version) video sound
    checkp(`movie.mp4`) ? `input=${dir}movie.mp4,stream=video,output=${dir}shaka-movie_video.mp4 ` : '' + // the original (mp4 version) video
    checkp(`movie720.mp4`) ? `input=${dir}movie720.mp4,stream=audio,output=${dir}shaka-movie720_audio.mp4 ` : '' + // the 720p video sound
    checkp(`movie720.mp4`) ? `input=${dir}movie720.mp4,stream=video,output=${dir}shaka-movie720_video.mp4 ` : '' + // the 720p video
    checkp(`movie540.mp4`) ? `input=${dir}movie540.mp4,stream=audio,output=${dir}shaka-movie540_audio.mp4 ` : '' + // the 540p video sound
    checkp(`movie540.mp4`) ? `input=${dir}movie540.mp4,stream=video,output=${dir}shaka-movie540_video.mp4 ` : '' + // the 540p video
    checkp(`movie360.mp4`) ? `input=${dir}movie360.mp4,stream=audio,output=${dir}shaka-movie360_audio.mp4 ` : '' + // the 360p video sound
    checkp(`movie360.mp4`) ? `input=${dir}movie360.mp4,stream=video,output=${dir}shaka-movie360_video.mp4 ` : '' + // the 360p video
    `--profile on-demand ` + // got this command from the internet don't know what is does
    `--mpd_output ${dir}video.mpd ` + // the mpd file to inform the shaka player
    `--min_buffer_time 4 ` + // a minimum buffer time of 4 i have dune this because this will meybe be ran on slow server that can't handele to much at the same time
    `--segment_duration 4` // the segment duration
    if (checkp(`shaka-movie_audio.mp4`) && checkp(`shaka-movie_video.mp4`) && checkp(`video.mpd`)) {
      // shaka files already exsist the next steps
      next()
    } else {
      // video doesn't exsist
      exec(command, () => {
        next()
      })
    }
  }
  let cleanup = (input, callback) => {
    // this will cleanup all file junk
    callback({status: true})
  }

  MakeMP4(`${videodir}testmovie.mkv`, () => {})

}
