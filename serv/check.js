const fs = require('fs-extra')
const x = exports

// a wrapper for string.prototype.includes
inc = (string,includes) => string.includes(includes)

x.checkofficalurl = (url) => {
  return ((
    url == '/' ||
    url == '' ||
    url == '/login' ||
    url == '/movies' ||
    inc(url,'/movies/') ||
    inc(url,'/music/') ||
    inc(url,'/album/') ||
    inc(url,'/home/') ||
    inc(url,'/settings/')
  ) ? true : false)
}

x.getpage = (url) => {
  let toReturn = ''
  if ((url == '/') || (url == '') || inc(url,'/home')) {
    toReturn = 'home'
  } else if (url == '/login') {
    toReturn = 'login'
  } else if (inc(url,'/movies')) {
    toReturn = 'movies'
  } else if (inc(url,'/music') || inc(url,'/alburlm')) {
    toReturn = 'music'
  } else if (inc(url,'/settings')) {
    toReturn = 'settings'
  }
  return toReturn
}

x.CheckDirEx = (path) => {
  return (fs.existsSync(path) && fs.lstatSync(path).isDirectory())
}
