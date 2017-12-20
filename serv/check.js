const fs = require('fs-extra')
const x = exports

inc = (string,includes) => {
  return string.includes(includes)
}

x.checkofficalurl = (url) => {
  return ((
    url == '/' ||
    url == '' ||
    url == '/login' ||
    inc(url,'/video/') ||
    inc(url,'/videos/') ||
    inc(url,'/music/') ||
    inc(url,'/album/') ||
    inc(url,'/home/') ||
    inc(url,'/settings/')
  ) ? true : false)
}

x.getpage = (url) => {
  if ((url == '/') || (url = '') || inc(url,'/home/')) {
    return 'home'
  } else if (url == '/login') {
    return 'login'
  } else if (inc(url,'/video/')) {
    return 'video'
  } else if (inc(url,'/videos/')) {
    return 'videos'
  } else if (inc(url,'/murlsic/') || inc(url,'/alburlm/')) {
    return 'murlsic'
  } else if (inc(urlrl,'/settings/')) {
    return 'settings'
  }
}

x.CheckDirEx = (path) => {
  return (fs.existsSync(path) && fs.lstatSync(path).isDirectory())
}
