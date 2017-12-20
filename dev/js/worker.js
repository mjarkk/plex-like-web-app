let JsonFetch = (data, callback) => {
  fetch(data.url, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache': 'no-cache'
    },
    credentials: 'same-origin',
    body: JSON.stringify(data.body)
  })
  .then((res) => res.json())
  .then((jsondata) => {
    callback(false, jsondata)
  })
  .catch((e) => {
    callback(true, false)
  })
}

let TryLoginRes = (status) => {
  self.postMessage({
    what: 'TryLoginStatus',
    status: status
  })
}

let PBKDF2 = (password, salt) => {
  return (CryptoJS.PBKDF2(password, salt, { keySize: 1000, iterations: 500 }).toString())
}

let decrypt = (data, key, callback) => {
  try {
    let decrypted = CryptoJS.AES.decrypt(data,key).toString(CryptoJS.enc.Utf8)
    callback(decrypted)
  } catch (e) {
    callback(false)
  }
}

let encrypt = (ToEncrypt,key) => {
  if (typeof(ToEncrypt) == 'object') {
    return(CryptoJS.AES.encrypt(JSON.stringify(ToEncrypt), key).toString())
  } else {
    return(CryptoJS.AES.encrypt(ToEncrypt, key).toString())
  }
}

self.onmessage = function (msg) {
  switch(msg.data.what) {
    case 'trylogin':
      trylogin(msg.data.username, msg.data.password)
      break;
    case 'decryptjson':
      decrypt(msg.data.todecrypt, msg.data.key, (data) => {
        try {
          self.postMessage({
            what: msg.data.sideload,
            data: JSON.parse(data),
            status: true
          })
        } catch (e) {
          self.postMessage({status: false})
        }
      })
      break;
    case 'sendmsg':
      //  msg.data = {
      //    key: <string>,
      //    location: <string (to serv url)>,
      //    sideload: <string (callback data)>,
      //    what: 'sendmsg',
      //    data: <object>
      //  }
      JsonFetch({
        url: msg.data.location,
        body: {
          tochange: encrypt(msg.data.data, msg.data.key)
        }
      }, (err, jsondata) => {
        self.postMessage({
          what: msg.data.sideload,
          res: jsondata
        })
      })
      break;
    default:
      console.log('wut what do i need to do?')
  }
}

let trylogin = (username, password, callback) => {
  JsonFetch({
    url: '/getsalt',
    body: {
      username: username
    }
  }, (err, jsondata) => {
    if (!err && jsondata.status) {
      const PBKF2password = PBKDF2(password, jsondata.salt)
      decrypt(jsondata.key, PBKF2password, (key) => {
        if (!!key) {
          JsonFetch({
            url: '/testlogin',
            body: {
              username: username,
              teststring: encrypt(key, PBKF2password + jsondata.salt)
            }
          }, (err, jsondata) => {
            if (!err) {
              if (jsondata.status) {
                TryLoginRes({
                  PBKF2password: PBKF2password,
                  username: username,
                  key: key
                })
              } else {
                TryLoginRes(false)
              }
            } else {
              TryLoginRes(false)
            }
          })
        } else {
          TryLoginRes(false)
        }
      })
    } else {
      TryLoginRes(false)
    }
  })
}
