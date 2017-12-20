#!/usr/bin/node

// this script restarts the server when there are changes made to the "./conf/servconfig.json"

const shell = require('shelljs')
const fs = require('fs-extra')
const colors = require('colors')
const watch = require('node-watch')

// servconfig
let globconf = require('./conf/servconfig.json')

// old content of 'conf/servconfig.json'
let serverconffile = './conf/servconfig.json'
let oldserverconfig = {}

// nodemon files
let nodemonfile = 'nodemon.json'

fs.readJson(serverconffile, (err, data) => {
  oldserverconfig = data
})

// check if the user has installed 'nodemon'
if (globconf.dev && !shell.which('nodemon')) {
  console.log('You don\'t have nodemon installed, install it by typing: npm i -g nodemon'.red)
  process.exit()
}

// a function for tricking nodemon to restart
let restart = () => setTimeout(() => {
  fs.readJson(nodemonfile, (err, data) => {
    data.trickrestart = !data.trickrestart
    fs.outputJson(nodemonfile, data, err => {
      console.log('tried to restart the server'.green)
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
    shell.exec('nodemon', {async: true}, () => {})
  }, 500)
} else {
  // run the script forever
  while (true) {
    shell.exec('node serv.js')
  }
}
