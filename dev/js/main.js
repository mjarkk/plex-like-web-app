window.LoadedScripts['main'] = true

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
      log('idk')
      s.onload = () => {
        callback()
      }
    }
  } else {
    log('Reqfile, Ilegal input:',require)
  }
}
