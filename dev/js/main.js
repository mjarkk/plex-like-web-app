window.LoadedScripts['main'] = true

// this file contains a lot of basic functions

let DisplayFlex = (item) => document.querySelector(item).style.display = 'flex'

// check for compatibility
if (!WebWorker || typeof(Storage) == "undefined") {
  document.querySelector('.notsupportedbrowser').style.display = 'block'
}

reqfile = (required, callback) => {
  let r = required
  let checkRequiredArray = () => {
    let checkarr = r.split('.')
    let returnval = true
    for (var i = 0; i < checkarr.length; i++) {
      (!window.LoadedScripts[checkarr[i]]) ?
        returnval = false :
        true
    }
    return returnval
  }
  if (typeof(r) == 'string') {
    if (checkRequiredArray()) {
      callback()
    } else {
      let s = document.createElement('script')
      if (r.indexOf('.') !== -1) {
        s.src = `/--${r}--/basic.js`
      } else {
        s.src = `/js/${ encodeURIComponent(r.replace('/','').replace('http','').replace('..','').replace('%2F','')) }.js`
      }
      document.body.append(s)
      s.onload = () => {
        callback()
      }
    }
  } else {
    log('Reqfile, Ilegal input:',require)
  }
}

// display a page
window.onload = () => {
  if (localStorage.getItem("key") && localStorage.getItem("username") && localStorage.getItem("PBKF2password")) {
    let page = currentpage
    log('startpage:',page)
    if (page == 'home') {
      DisplayFlex('.home-vue')
    } else if (page == 'login') {
      reqfile('login', () => {
        DisplayFlex('.login-vue')
      })
    }
  } else {
    reqfile('login', () => {
      DisplayFlex('.login-vue')
    })
  }
}

// a function to capitalize a sense
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

// handele all the url's
class urlhandeler {
  constructor() {
    window.addEventListener('popstate', (ev) => {
      // check if the user changes the url
      if (!location.href.includes('#')) {
        log(location.href)
      }
    })
  }
  changePath(newpath) {
    location.hash = newpath
    history.replaceState(null, null, newpath)
    // history.replaceState(null, null, newpath)
  }
}

// create a url handeler and make it global so all the js files can make use of it
let UrlHandeler = new urlhandeler()
