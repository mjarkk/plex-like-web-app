
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
      trylogin(msg.data.username, msg.data.password,(status) => {
        self.postMessage({
          what: 'TryLoginStatus',
          status: status
        })
      })
      break;
    case 'login':
      console.log('login')
      break;
    default:
      console.log('wut what do i need to do?')
  }
}

let trylogin = (username, password, callback) => {
  fetch('/getsalt', {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Cache': 'no-cache'
    },
    credentials: 'same-origin',
    body: JSON.stringify({
      username: username
    })
  })
  .then((res) => res.json())
  .then((jsondata) => {
    if (jsondata.status) {
      decrypt(jsondata.key, PBKDF2(password, jsondata.salt), (key) => {
        console.log(key)
        callback(!!key)
      })
    } else {
      callback(false)
    }
  })
}
