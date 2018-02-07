const test = require('ava')
const fs = require('fs-extra')
const colors = require('colors')
const path = require('path')

if (process.env.TRAVIS) {
  test.setTimeout(30000)
}

// tell all the required script that this is the testing code
// that will block automatic tasks that that scripts do when they are called
// this also changes the way scripts do callbacks
global.testingCode = true

// replace console.log() with log()
global.log = console.log

const confFile = './conf/servconfig.json'

if (fs.existsSync(confFile)) {
  global.globconf = require(confFile)

  const dba = require('./serv/database.js')
  const js = require('./serv/js.js')
  const css = require('./serv/sass.js')
  const img = require('./serv/img.js')

  let waitForDB = (tocheck, callback) => {
    let check = () => {
      if (dba[tocheck]) {
        callback()
      } else {
        wait()
      }
    }

    let wait = () => setTimeout(() => {
      check()
    }, 100)

    check()
  }

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
      t.fail(e)
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
      t.fail(e)
      t.end()
    }
  })

  test.cb('encryption and decryption with text', t => {
    t.plan(1)
    waitForDB('encrypt', () => {
      try {
        let encryptionTestString = dba.encrypt('test','test')
        dba.decrypt(encryptionTestString, 'test', (decrypteData) => {
          t.is(decrypteData, 'test')
        })
      } catch (e) {
        t.fail(e)
      } finally {
        t.end()
      }
    })
  })

  test.cb('encryption and decryption with a object', t => {
    t.plan(1)
    waitForDB('encrypt', () => {
      try {
        let encryptionTestString = dba.encrypt({data: 'test'} ,'test')
        dba.decrypt(encryptionTestString, 'test', (decrypteData) => {
          let jsondata = JSON.parse(decrypteData)
          t.is(typeof jsondata, 'object')
        })
      } catch (e) {
        t.fail(e)
      } finally {
        t.end()
      }
    })
  })

  test.cb('emulate eddited image from location', t => {
    t.plan(1)
    data = {
      imgpath: path.resolve(__dirname, 'static/img/test.jpg'),
      quality: 70,
      size: {
        height: 200,
        width: 200
      },
      req: {},
      res: {
        send: (buffer) => {
          t.pass()
          t.end()
        },
        set: () => {
          // OK
        },
        end: () => {
          t.fail(`serv/img.js needs to do: res.send()`)
          t.end()
        },
        sendFile: (file) => {
          t.fail(
            `Script response with sending a file, it needs to change
            the image and send a buffer via res.send()`
          )
          t.end()
        }
      }
    }
    try {
      img.SendImgPath(data)
    } catch (e) {
      t.fail(e)
      t.end()
    }
  })

} else {
  log('this projects needs `conf/servconfig.json` this error is here because you probably have not started the server yet'.red.bold)
}
