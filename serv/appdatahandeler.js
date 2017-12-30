// this file makes shure that everyting is corect and works
// focus on the appdata folder

// required packages
const fs = require('fs-extra')

// user data directory
const datadir = './appdata/'
const cachedir = './cache/'

fs.ensureDirSync(`${cachedir}`)
fs.ensureDirSync(`${cachedir}images`)

fs.ensureDirSync(`${datadir}images/public`)
fs.ensureDirSync(`${datadir}movies/public`)
fs.ensureDirSync(`${datadir}music/public`)
