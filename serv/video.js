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

x.sendMPD = (req,res) => {
  let file = req.params.reqfile
  let videoid = req.params.videoid
  if (file && videoid) {
    let dirname = path.resolve(__dirname,'..',`appdata/movies/public/${videoid}/`)
    if (file == 'mpd') {
      res.sendFile(path.resolve(dirname,'video.mpd'))
    } else {
      res.sendFile(path.resolve(dirname,file))
    }
  } else {
    res.send('404')
  }
}

// a array of all direcotrys to check for video files
let dirstocheck = []
// a arrah with all files to check
let filestocheck = []

// add public dir's to dirstocheck
for (var i = 0; i < globconf.moviedirs.length; i++) {
  dirstocheck.push(globconf.moviedirs[i])
}

// a function for creating a index with all files in direcotrys
let dirloop = (index) => {
  const dir = dirstocheck[index]
  if (typeof(dir) == 'string') {
    fs.readdir(dir, (err, files) => {
      for (file of files) {
        let FullPath = `${dir}/${file}`
        let FileStats = fs.lstatSync(FullPath)
        if (FileStats.isDirectory()) {
          dirstocheck.push(FullPath)
        } else {
          filestocheck.push(FullPath)
        }
      }
      dirloop(index + 1)
    })
  } else {
    filesloop(0)
  }
}

// check for every file if it's compatible
let filesloop = (i) => {
  // fc is short for file check
  let fc = filestocheck[i]
  let next = () => filesloop(i + 1)
  if (fc) {
    if (fc.endsWith('.mkv') || fc.endsWith('.mp4')) {
      log(`compress:`,fc)
      compile(fc, (log) => {
        next()
      })
    } else {
      next()
    }
  } else {
    // end of check list
  }
}

let compile = (videofile, callback) => {
  // TODO: a lot of direcotry will only work on linux and/or mac because of the fix for spaces in files / direcotrys
  sha1File(videofile, (error, sum) => {
    if (error) {
      callback({status:false})
    } else {
      // this will give erros if set to true, this is purly for testing
      const ffmpeg = `ffmpeg -v quiet -stats -y -i`
      const videodir = `./appdata/movies/public/${sum}/`

      // make shure the direcotry exsist
      fs.ensureDir(path.resolve(__dirname, '..', videodir), () => {

        // input is a basic input string
        let input = `${ffmpeg} ${videofile} `

        // ltf is a function that will replace all spaces with "\ "
        let ltf = (inp) => inp.replace(/ /g,'\\ ')
        let p720 = (from, to) => `${ffmpeg} ${ltf(from)} `+
        `-bufsize 1000k -maxrate 1500k -b:v 1500k `+
        `-ac 2 -ab 256k -ar 48000 -c:v libx264 ` +
        `-preset veryfast -c:a copy ` +
        `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
        ` -vf "scale=-2:720" ${ltf(to)}`
        let p540 = (from, to) => `${ffmpeg} ${ltf(from)} `+
        `-bufsize 500k -maxrate 800k -b:v 800k `+
        `-ac 2 -ab 128k -ar 44100 -c:v libx264 ` +
        `-preset veryfast -c:a copy ` +
        `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
        ` -vf "scale=-2:540" ${ltf(to)}`
        let p360 = (from, to) => `${ffmpeg} ${ltf(from)} `+
        `-bufsize 400k -maxrate 400k -b:v 400k `+
        `-ac 2 -ab 64k -ar 22050 -c:v libx264 ` +
        `-preset veryfast -c:a copy ` +
        `-x264opts 'keyint=27:min-keyint=27:no-scenecut' `+
        ` -vf "scale=-2:360" ${ltf(to)}`

        // a wraper for shell.exec with async functionality
        let exec = (input, callback) => shell.exec(input, { async: true }, () => callback())
        // presolve is short for path resove and is a wrapper around path.resolve
        let presolve = (input) => path.resolve(__dirname,'..',input)
        // fexsist is short for file exsist this is a warpper around presolve
        let fexsist = (input) => fs.existsSync(presolve(input))

        // input is the oritinal file location relative from the root of this project OR from the root of the pc
        let MakeMP4 = (input, callback) => {

          // next is a wrapper for the make720p function
          let next = () => fs.ensureFile(presolve(nextinput + '.dune'), err => Make720P(nextinput, callback))
          let nextinput = `${videodir}movie.mp4`
          if (fs.existsSync(input)) {
            if (fexsist(nextinput + '.dune') && fexsist(nextinput)) {
              // a movie file of the image does already exsist skip this step
              if (fexsist('shaka-movie_video.mp4')) {
                let inputdir = path.parse(nextinput).dir + '/'
                cleanup(inputdir, callback)
              } else {
                next()
              }
            } else if (fexsist('shaka-movie_video.mp4')) {
              // the the complete movie is already compiled retrun true
              callback({status: true})
            } else {
              // create a mp4 copy of the file
              log(`Creating full mp4 file`)
              exec(`${ffmpeg} ${ltf(input)} -codec copy ${ltf(nextinput)}`, () => next())
            }
          } else {
            log('input file does not exsist')
            callback({status: false})
          }
        }

        // the input is the ouput file from MakeMP4
        let Make720P = (input, callback) => {
          let nextinput = `${videodir}movie720.mp4`
          let next = () => fs.ensureFile(presolve(nextinput + '.dune'), err => Make540P(nextinput, callback))
          if (fexsist(input)) {
            if (fexsist(nextinput + '.dune') && fexsist(nextinput)) {
              // a movie file of the image does already exsist skip this step
              next()
            } else if (fexsist('shaka-movie_video.mp4')) {
              // the the complete movie is already compiled retrun true
              if (fexsist(nextinput)) {
                let inputdir = path.parse(nextinput).dir + '/'
                cleanup(inputdir, callback)
              } else {
                callback({status: true})
              }
            } else {
              // create a mp4 copy of the file
              log(`Creating 720p version`)
              exec(p720(input,nextinput), () => next())
            }
          } else {
            log('input file does not exsist')
            callback({status: false})
          }
        }
        let Make540P = (input, callback) => {
          let nextinput = `${videodir}movie540.mp4`
          let next = () => fs.ensureFile(path.resolve(__dirname,'..',nextinput + '.dune'), err => Make360P(input, callback))
          if (fexsist(input)) {
            if (fexsist(nextinput + '.dune') && fexsist(nextinput)) {
              // a movie file of the image does already exsist skip this step
              next()
            } else if (fexsist('shaka-movie_video.mp4')) {
              // the the complete movie is already compiled retrun true
              if (fexsist(nextinput)) {
                let inputdir = path.parse(nextinput).dir + '/'
                cleanup(inputdir, callback)
              } else {
                callback({status: true})
              }
            } else {
              // create a mp4 copy of the file
              log(`Creating 540p version`)
              exec(p540(input,nextinput), () => next())
            }
          } else {
            log('input file does not exsist')
            callback({status: false})
          }
        }
        let Make360P = (input, callback) => {
          let next = () => fs.ensureFile(path.resolve(__dirname,'..',nextinput + '.dune'), err => CreateShakaPackage(input, callback))
          let nextinput = `${videodir}movie360.mp4`
          if (fexsist(input)) {
            if (fexsist(nextinput + '.dune') && fexsist(nextinput)) {
              // a movie file of the image does already exsist skip this step
              next()
            } else if (fexsist('shaka-movie_video.mp4')) {
              // the the complete movie is already compiled retrun true
              if (fexsist(nextinput)) {
                let inputdir = path.parse(nextinput).dir + '/'
                cleanup(inputdir, callback)
              } else {
                callback({status: true})
              }
            } else {
              // create a 360p version of the file
              log(`Creating 360p version`)
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
          let checkp = (input) => fexsist(`${dir}${input}`)
          let oss = os.platform()
          let command = `./dev/shaka-packager/`+
          `${(oss == 'win32') ? 'windows.exe' : (oss == 'darwin') ? 'macos' : 'linux' } ` + // check witch program it needs to use
          `${checkp(`movie.mp4`) ? `input=${dir}movie.mp4,stream=audio,output=${dir}shaka-movie_audio.mp4 ` : '' }`+ // the original (mp4 version) video sound
          `${checkp(`movie.mp4`) ? `input=${dir}movie.mp4,stream=video,output=${dir}shaka-movie_video.mp4 ` : '' }`+ // the original (mp4 version) video
          `${checkp(`movie720.mp4`) ? `input=${dir}movie720.mp4,stream=audio,output=${dir}shaka-movie720_audio.mp4 ` : '' }`+ // the 720p video sound
          `${checkp(`movie720.mp4`) ? `input=${dir}movie720.mp4,stream=video,output=${dir}shaka-movie720_video.mp4 ` : '' }`+ // the 720p video
          `${checkp(`movie540.mp4`) ? `input=${dir}movie540.mp4,stream=audio,output=${dir}shaka-movie540_audio.mp4 ` : '' }`+ // the 540p video sound
          `${checkp(`movie540.mp4`) ? `input=${dir}movie540.mp4,stream=video,output=${dir}shaka-movie540_video.mp4 ` : '' }`+ // the 540p video
          `${checkp(`movie360.mp4`) ? `input=${dir}movie360.mp4,stream=audio,output=${dir}shaka-movie360_audio.mp4 ` : '' }`+ // the 360p video sound
          `${checkp(`movie360.mp4`) ? `input=${dir}movie360.mp4,stream=video,output=${dir}shaka-movie360_video.mp4 ` : '' }`+ // the 360p video
          `--profile on-demand ` + // got this command from the internet don't know what is does
          `--mpd_output ${dir}video.mpd ` + // the mpd file to inform the shaka player
          `--min_buffer_time 4 ` + // a minimum buffer time of 4 i have dune this because this will meybe be ran on slow server that can't handele to much at the same time
          `--segment_duration 4` // the segment duration
          if (checkp(`shakacreated.dune`) && checkp('shaka-movie_audio.mp4') && checkp('shaka-movie_video.mp4')) {
            // shaka files already exsist go to the next steps
            next()
          } else {
            // video doesn't exsist
            log(`Creating web player files`)
            exec(command, () => {
              fs.ensureFile(path.resolve(__dirname,'..',`${dir}shakacreated.dune`) ,() => {
                next()
              })
            })
          }
        }
        let cleanup = (input, callback) => {
          // this will cleanup all files that are useless and will only take up space
          let removefiles = ['movie.mp4','movie720.mp4','movie540.mp4','movie360.mp4']
          let removefile = (index) => {
            let toRemove = removefiles[index]
            if (toRemove) {
              let next = () => removefile(index + 1)
              toRemove = input + toRemove
              if (fs.existsSync(toRemove)) {
                fs.remove(toRemove, err => {
                  next()
                })
              } else {
                // can't find file to remove skip that choise
                next()
              }
            } else {
              // dune removeing all useless files
              callback({status: true})
            }
          }
          removefile(0)
        }

        MakeMP4(videofile, callback)
      })
    }
  })
}

dirloop(0)
