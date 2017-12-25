window.LoadedScripts['home'] = true

var home = new Vue({
  el: '.home-vue',
  data: {
    appname: 'Cloud',
    username: '',
    apps: [{
      name: 'home',
      icon: `<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"> <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/> <path d="M0 0h24v24H0z" fill="none"/> </svg>`
    },{
      name: 'movies',
      icon: `<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"> <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/> <path d="M0 0h24v24H0z" fill="none"/> </svg>`
    },{
      name: 'music',
      icon: `<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"> <path d="M0 0h24v24H0z" fill="none"/> <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 5h-3v5.5c0 1.38-1.12 2.5-2.5 2.5S10 13.88 10 12.5s1.12-2.5 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zM4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/> </svg>`
    },{
      name: 'images',
      icon: `<svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"> <path d="M0 0h24v24H0z" fill="none"/> <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/> </svg>`
    },{
      name: 'settings',
      icon: ` <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"> <path d="M0 0h24v24H0z" fill="none"/> <path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/> </svg>`
    }],
    activeapp: 'home',
    settingsloaded: false,
    settings: {
      selected: 'server',
      server: {
        updatebtndisabled: false,
        port: 0,
        lastport: 0,
        porterr: '',
        dev: true,
        imagedirs: '',
        imagedirserr: '',
        moviedirs: '',
        moviedirserr: '',
        musicdirs: '',
        musicdirserr: '',
        users: [{
          username: 'admin'
        }]
      },
      client: {

      }
    },
    images: {
      loadedBasic: false,
      images: []
    }
  },
  methods: {
    updatesettings: () => {
      // a function for updating the user settings
      let serv = home.settings.server
      serv.updatebtndisabled = true
      WebWorker.postMessage({
        what: 'sendmsg',
        location: '/updatesettings/basic',
        key: localStorage.getItem('key'),
        data: {
          port: serv.port,
          dev: serv.dev,
          imagedirs: [serv.imagedirs],
          moviedirs: [serv.moviedirs],
          musicdirs: [serv.musicdirs]
        },
        sideload: 'updatethings'
      })
      // this for loop will remove the error's from the settings when a user tries to re updates his settings
      let serveroptions = ['imagedirs','moviedirs','musicdirs']
      for (var i = 0; i < serveroptions.length; i++) {
        home.settings.server[serveroptions[i] + 'err'] = ''
      }
    }
  },
  watch: {
    activeapp: (newval, oldval) => {
      // load the right data for the view when it's clicked
      // also most of the work is pushed to a webworker for a smoother experiance
      // and the webworker has the cryptojs libary that it needs when requesting data from the server
      if (newval == 'settings') {
        fetch('/getsettings',{method: 'post',credentials: 'same-origin'})
        .then(res => res.json())
        .then(jsondata => {
          if (jsondata.status) {
            WebWorker.postMessage({
              what: 'decryptjson',
              key: localStorage.getItem('key'),
              todecrypt: jsondata.data,
              sideload: 'getusersettings'
            })
          }
        })
        .catch((e) => true)
      } else if (newval == 'images' && !home.images.loadedBasic) {
        fetch('/imageindex/0', {method: 'post',credentials: 'same-origin'})
        .then(res => res.json())
        .then(jsondata => {
          home.images.loadedBasic = true
          WebWorker.postMessage({
            what: 'decryptjson',
            key: localStorage.getItem('key'),
            todecrypt: jsondata.data,
            sideload: 'getbasicimages'
          })
        })
        .catch((e) => true)
      }
    }
  },
  created: () => setTimeout( () => {
    // a timeout because sometimes the 'home' variable is not set
    // this fixes the problem for some reason because a setTimeout runs Async
    home.username = localStorage.getItem('username')
    fetch('/basicinf',{method: 'post',credentials: 'same-origin', body: JSON.stringify({from: home.activeapp})})
    .then((res) => res.json())
    .then((jsondata) => {
      log(jsondata)
    })
    .catch((e) => true)
  }, 1)
})

// a webworker Event Listener this handels all the callback data from the webworker
WebWorker.addEventListener('message', (msg) => {
  const data = msg.data

  if (data.what == 'getusersettings' && data.status) {
    // all the user settings
    const inf = data.data
    // log(inf)
    home.settings.server.port = inf.port
    home.settings.server.lastport = inf.port
    home.settings.server.dev = inf.dev
    home.settings.server.imagedirs = inf.imagedirs[0] || ''
    home.settings.server.moviedirs = inf.moviedirs[0] || ''
    home.settings.server.musicdirs = inf.musicdirs[0] || ''
    home.settingsloaded = true
  } else if (data.what == 'updatethings') {
    // callback from the server for updating the settings
    // log(data)

    home.settings.server.updatebtndisabled = false
    if (data.res.errors) {
      // set all errors if there are anny
      for (var i = 0; i < data.res.errors.length; i++) {
        const err = data.res.errors[i]
        log(err)
        if (typeof(home.settings.server[err.for + 'err']) == 'string') {
          home.settings.server[err.for + 'err'] = err.what
        }
      }
    }
    // give a warning if the port has changed
    if (home.settings.server.port != home.settings.server.lastport) {
      home.settings.server.porterr = 'The port has changed... this might result in some weird browser behaviours'
    }
    home.settings.server.lastport = home.settings.server.port
  } else if (data.what == 'getbasicimages' && data.status) {
    for (var i = 0; i < data.data.length; i++) {
      let item = data.data[i]
      let date = new Date(item[0])
      home.images.images.push({
        date: date,
        id: item[1]
      })
      // item[0] = this is the date of the image taken, this is mainly for the backend
      // item[1] = this is the sha1 of the image mainly used to indentify and request the image
    }
  }
})
