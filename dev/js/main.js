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
      let newPath = location.pathname
      if (!location.href.includes('#')) {
        this.GoTo(newPath)
      }
    })
  }
  CloseMoviePlayer() {
    if (typeof moviePlayer != 'undefined') {
      moviePlayer.closeplayer()
    } else {
      document.querySelector('.videoplayer-vue').style.display = 'none'
    }
  }
  CloseImgViewer() {
    if (typeof imgviewer != 'undefined') {
      imgviewer.closeimgviewer()
    } else {
      document.querySelector('.img-viewer-vue').style.display = 'none'
    }
  }
  GoTo(to) {
    if (to == '/') {
      home.activeapp = 'home'
    } else if (to == '/home' || to == '/movies' || to == '/settings' || to == '/music' || to == '/images') {
      // load the movie view
      home.activeapp = to.replace('/','')
      this.CloseImgViewer()
      this.CloseMoviePlayer()
    } else if (to.startsWith('/img/')) {
      // load the image view if the image is in home.images.images
      let testArray = home.images.images
      let id = to.replace('/img/','')
      for (var i = 0; i < testArray.length; i++) {
        if (testArray[i].id == id) {
          reqfile('imgviewer', () => {
            document.querySelector('.img-viewer-vue').style.display = 'block'
            imgviewer.showimg({
              aspect: testArray[i].aspect,
              id: testArray[i].id,
              previewurl: testArray[i].url
            })
          })
          break;
        }
      }
    }
    log('go to:', to)
  }
  changePath(newpath) {
    // check if the input url starts with a /
    newpath = (newpath[0] == '/') ? newpath : `/${newpath}`
    // because the browser doesn't fire the popstate and location.hash event when...
    // only useing history.pushState or history.replaceState it needs to use this hack that will work
    // first the browser sets the location.hash of the page to the new location
    location.hash = newpath.replace(/\//g,'') // replace all "/" with '' because it breaks a url
    // than the browser update the path with the write one
    history.replaceState(null, null, newpath)
    // now when it changes the popstate reacts it reacts with the location.hash url what...
    // it can easialy filter out because we don't want to do things dubble
    // but when the user clickes the back or forward button the popstate sees the actual url not the location.hash url
  }
}

// create a url handeler and make it global so all the js files can make use of it
let UrlHandeler = new urlhandeler()
