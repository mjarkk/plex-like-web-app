#!/usr/bin/node

// this script restarts the server when there are changes made to the "./conf/servconfig.json"

const shell = require('shelljs')
const fs = require('fs-extra')
const colors = require('colors')
const watch = require('node-watch')
const questions = require('questions')
const MongoClient = require('mongodb').MongoClient

// chmod +x the dev/shaka-packager/linux and dev/shaka-packager/macos
shell.exec('chmod +x dev/shaka-packager/linux')
shell.exec('chmod +x dev/shaka-packager/macos')

global.testingCode = false

global.log = console.log

// check if there is already a config file
if (!fs.existsSync('./conf/servconfig.json')) {
  fs.copySync('./conf/basic-conf.json', './conf/servconfig.json')
  log('created config file')
}

// old content of 'conf/servconfig.json'
let serverconffile = './conf/servconfig.json'
let oldserverconfig = {}

// servconfig
global.globconf = require(serverconffile)

// database file
const dba = require('./serv/database.js')

// this function tests if the database exists and works.
// this also tests if there is already a user, if not it will aks the user to create one (this will be a administrator accound)
let blockcheck = false
let checkdb = () => {
  if (typeof dba.check == 'function') {
    dba.check(output => {
      if (!blockcheck) {
        if (output.status) {
          runbase()
        } else {
          if (output.users) {
            // need to create user accound
            log('Need to create a user enter a username and password')
            questions.askOne({ info: 'Username' }, (username) => {
              questions.askOne({ info: 'Password' }, (password) => {
                dba.createuser({username: username, password: password, check: false},() => {
                  log('created user')
                  log('start server')
                  runbase()
                })
              })
            })
          }
        }
      }
      blockcheck = true
    })
  } else if(!blockcheck) {
    setTimeout(() => {
      checkdb()
    }, 100)
  }

}
if (!shell.which('ffmpeg')) {
  log('no ffmpeg found')
  log('you need ffmpeg to run this project')
  log('If you are using UBUNTU try this: apt install ffmpeg')
  log('If you are using WINDOWS try this: https://www.wikihow.com/Install-FFmpeg-on-Windows')
  process.exit()
} else {
  checkdb()
}

let runbase = () => {

  // nodemon files
  let nodemonfile = 'nodemon.json'

  fs.readJson(serverconffile, (err, data) => {
    oldserverconfig = data
  })

  // check if the user has installed 'nodemon'
  if (globconf.dev && !shell.which('nodemon')) {
    log('You don\'t have nodemon installed, install it by typing: npm i -g nodemon'.red)
    process.exit()
  }

  // a function for tricking nodemon to restart
  let restart = () => setTimeout(() => {
    fs.readJson(nodemonfile, (err, data) => {
      data.trickrestart = !data.trickrestart
      fs.outputJson(nodemonfile, data, err => {
        log('tried to restart the server'.green)
      })
    })
  }, 2000)

  if (globconf.dev) {
    watch(serverconffile, { recursive: true }, (evt, name) => {
      fs.readJson(serverconffile, (err, data) => {
        if (data.dev !== oldserverconfig.dev ||
          data.port != oldserverconfig.port ||
          JSON.stringify(data.imagedirs) != JSON.stringify(oldserverconfig.imagedirs) ||
          JSON.stringify(data.moviedirs) != JSON.stringify(oldserverconfig.moviedirs) ||
          JSON.stringify(data.musicdirs) != JSON.stringify(oldserverconfig.musicdirs)
        ) {
          restart()
        }
        oldserverconfig = data
      })
    })
  }

  // if dev is true run the script using nodemon
  if (globconf.dev) {
    setTimeout(() => {
      shell.exec('nodemon serv.js', {async: true}, () => {})
    }, 500)
  } else {
    // run the script forever
    while (true) {
      shell.exec('node serv.js')
    }
  }

}
