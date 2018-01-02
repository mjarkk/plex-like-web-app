window.LoadedScripts['main'] = true

let DisplayFlex = (item) => document.querySelector(item).style.display = 'flex'

// check for compatibility
if (!WebWorker || typeof(Storage) == "undefined") {
  document.querySelector('.notsupportedbrowser').style.display = 'block'
}

reqfile = (required, callback) => {
  let r = required
  if (typeof(r) == 'string') {
    if (window.LoadedScripts[r]) {
      callback()
    } else {
      let s = document.createElement('script')
      s.src = `/js/${ encodeURIComponent(required.replace('/','').replace('http','').replace('..','').replace('%2F','')) }.js`
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
