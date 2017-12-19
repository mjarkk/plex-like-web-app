// this script restarts the server when there are changes made to the "./conf/servconfig.json"
const shell = require('shelljs')
const fs = require('fs-extra')
const watch = require('node-watch')
const colors = require('colors')
const globconf = require('./conf/servconfig.json')

// basic command
let excommand = 'node serv.js'

// check if the user has installed 'nodemon'
if (globconf.dev && !shell.which('nodemon')) {
  console.log('You don\'t have nodemon installed, install it by typing: npm i -g nodemon'.red)
  process.exit()
}

// if dev is true run the script using nodemon
if (globconf.dev) {
  excommand = 'nodemon'
}

// run the script forever
while (true) {
  shell.exec(excommand)
}


// for later use

// setTimeout(() => {
//   watch('./conf/servconfig.json', (evt, name) => {
//     console.log(name)
//   })
// }, 2000)
