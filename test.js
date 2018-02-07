const test = require('ava')
const fs = require('fs-extra')
const colors = require('colors')

// tell all the required script that this is the testing code
// that will block automatic tasks that that scripts do when they are called
// this also changes the way scripts do callbacks
global.testingCode = true

// replace console.log() with log()
global.log = console.log

const confFile = './conf/servconfig.json'

if (fs.existsSync(confFile)) {
  global.globconf = require(confFile)
  // require the global config

  const js = require('./serv/js.js')
  const css = require('./serv/sass.js')

  test.cb('create js files', t => {
    t.plan(1)
    try {
      js.run(data => {
        if (data.length > 0) {
          log(data.red.bold)
          t.fail()
        } else {
          t.pass()
        }
    		t.end()
      })
    } catch (e) {
      t.fail()
      t.end()
    }
  })

  test.cb('create css files', t => {
    t.plan(1)
    try {
      css.run(data => {
        if (data.length > 0) {
          log(data.red.bold)
          t.fail()
        } else {
          t.pass()
        }
    		t.end()
      })
    } catch (e) {
      t.fail()
      t.end()
    }
  })

} else {
  log('this projects needs `conf/servconfig.json` this error is here because you probably have not started the server yet'.red.bold)
}
