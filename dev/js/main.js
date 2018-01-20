window.LoadedScripts['main'] = true

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
    log(page)
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

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
