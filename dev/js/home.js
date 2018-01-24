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
      rechedend: false,
      imagesindex: 0,
      baseimgheight: 200,
      loadedBasic: false,
      images: [],
      imagesindexes: {}
    },
    movies: {
      list: [],
      ShowMoreInfo: false,
      selectedID: 0,
      selectedEdit: false,
      selected: {
        background: '',
        belongs: {
          name: '',
          poster: ''
        },
        id: '30dc0050ba21d0ffe3743619c51181506c5ccda0',
        moviename: 'Mr.Robot.S03E09.720p.HDTV.x264-AVS',
        poster: true,
        show: true,
      }
    }
  },
  methods: {
    openmoreinfo: (movie) => {
      home.movies.ShowMoreInfo = true
      home.movies.selected = movie
    },
    closeVideoPopup: (ev) => {
      if (ev.srcElement.classList[0] == 'video-popup') {
        home.movies.ShowMoreInfo = false
      }
    },
    fetchMovieList: () => {
      // fetch the movie list
      fetch(`/videoindex/`, {method: 'post',credentials: 'same-origin'})
      .then(res => res.json())
      .then(jsondata => {
        WebWorker.postMessage({
          what: 'decryptjson',
          key: localStorage.getItem('key'),
          todecrypt: jsondata.data,
          sideload: 'getbasicvideos'
        })
      })
      .catch((e) => true)
    },
    createVideoList: (data) => {
      // this fuction is used to handele the belongs object inside data
      home.movies.list = data
      log(data)
    },
    openmovie: (movie) => {
      document.querySelector('.videoplayer-vue').style.display = 'block'
      reqfile('shaka-player-compiled-debug.videoplayer', () => {
        moviePlayer.loadvideo(movie)
      })
      home.movies.ShowMoreInfo = false
    },
    openimg: (image) => reqfile('imgviewer', () => {
      // open image
      document.querySelector('.img-viewer-vue').style.display = 'block'
      imgviewer.showimg({
        aspect: image.aspect,
        id: image.id,
        previewurl: image.url
      })
    }),
    ReturnDay: (year, month, day) => {
      // return a full date with the the day name and month name
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      const date = new Date(`${year.replace(/-/g,'')}-${month.replace(/-/g,'')}-${day.replace(/-/g,'')}`)
      return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()].substring(0,3)}`
    },
    fetchnewimgs: (callback) => {
      // fetch list with images
      if (!home.images.rechedend) {
        home.images.imagesindex = home.images.imagesindex + 1

        // calculate the amound of images to load this depends on the screen resolution of the user
        let scrollel = document.querySelector('.home-vue .content')
        let loadamound = Math.round((scrollel.offsetWidth / home.images.baseimgheight * 1.1) * (scrollel.offsetHeight / home.images.baseimgheight * 1.45))

        fetch(`/imageindex/${home.images.imagesindex - 1}/${loadamound}`, {method: 'post',credentials: 'same-origin'})
        .then(res => res.json())
        .then(jsondata => {
          home.images.loadedBasic = true
          WebWorker.postMessage({
            what: 'decryptjson',
            key: localStorage.getItem('key'),
            todecrypt: jsondata.data,
            sideload: 'getbasicimages'
          })
          if (callback) callback(true)
        })
        .catch((e) => true)
      } else {
        if (callback) callback(false)
      }
    },
    ImgPreMake: (from) => {
      // creates a object with all images you will need that the browser can pre-render
      let imgs = home.images.images
      let time = {}
      for (var from = 0; from < imgs.length; from++) {
        let i = from
        let img = imgs[i]
        let date = new Date(imgs[i].date)
        let year = '-' + date.getFullYear() + '-'
        let month = '-' + (date.getMonth() + 1) + '-'
        let day = '-' + date.getDate() + '-'
        if (!time[year]) {
          time[year] = {}
        }
        if (!time[year][month]) {
          time[year][month] = {}
        }
        if (!time[year][month][day]) {
          time[year][month][day] = {
            rows: [],
            available: []
          }
        }
        time[year][month][day].available.push({
          id: i,
          aspect: img.aspect
        })
      }
      let ContentWidth = document.querySelector('.content').clientWidth - 200
      for (const year in time) {
        if (time[year]) {
          for (const month in time[year]) {
            if (time[year][month]) {
              for (const day in time[year][month]) {
                if (time[year][month][day]) {
                  let testsize = 0
                  let dayimgs = time[year][month][day].available
                  time[year][month][day].rows.push([])
                  for (img of dayimgs) {
                    let imgsize = Math.round(img.aspect * home.images.baseimgheight)
                    imgsize = (imgsize > 700) ? 700 : imgsize
                    let newsize = testsize + imgsize
                    if (newsize >= ContentWidth) {
                      testsize = 0
                      time[year][month][day].rows.push([])
                    } else {
                      testsize = newsize
                    }
                    home.images.images[img.id].RenderWidth = imgsize
                    home.images.images[img.id].RenderHeight = home.images.baseimgheight
                    time[year][month][day].rows[time[year][month][day].rows.length - 1].push(img)
                  }
                  time[year][month][day].available = []
                }
              }
            }
          }
        }
      }
      home.images.imagesindexes = time
    },
    LoadImages: (from) => {
      // a method for loading images
      let forimgs = (id) => {
        if (home.images.images[id]) {
          let image = home.images.images[id]
          let LoadingImg = new Image(image.RenderWidth, image.RenderHeight)
          LoadingImg.src = `/image/${image.id}/60/${image.RenderWidth}x${image.RenderHeight}/false` // the last false means it is webp still need to support that
          image.url = LoadingImg.src
          LoadingImg.onload = () => {
            image.show = true
            forimgs(id + 1)
          }
          LoadingImg.onerror = () => {
            // can't load the image
            forimgs(id + 1)
          }
        } else {
          // last image loaded
        }
      }
      forimgs(from)
    },
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
      UrlHandeler.changePath(newval)
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
        home.fetchnewimgs()
      } else if (newval == 'movies') {
        home.fetchMovieList()
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
    let scrollel = document.querySelector('.home-vue .content')
    let currentlysearching = false
    let lastwith = undefined
    scrollel.onscroll = () => {
      if(!currentlysearching && home.activeapp == 'images' && scrollel.scrollTop + scrollel.offsetHeight > (scrollel.scrollHeight - scrollel.offsetHeight) / 1.5) {
        currentlysearching = true
        home.fetchnewimgs(() => setTimeout(() => {
          currentlysearching = false
        }, 100))
      }
      if (!lastwith) {
        lastwith = scrollel.offsetWidth
      } else if (home.activeapp == 'images' && lastwith != scrollel.offsetWidth) {
        // re-render the image layout if the width of the page changes
        home.ImgPreMake(0)
        lastwith = scrollel.offsetWidth
      }
    }
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
    if (data.data.length == 0) {
      home.images.rechedend = true
    }
    let imagesLenght = home.images.images.length
    for (var i = 0; i < data.data.length; i++) {
      let item = data.data[i]
      let date = new Date(item[0])
      let save = {
        date: date,
        id: item[1],
        show: false,
        url: '',
        width: item[2],
        height: item[3],
        aspect: 1.5,
        RenderWidth: item[2], // this will be later set to a relative size
        RenderHeight: item[3]
      }
      if (item[2] && item[3]) {
        save.aspect = Math.round(100 * (item[2] / item[3])) / 100
      }
      home.images.images.push(save)
      // item[0] = this is the date of the image taken, this is mainly for the backend
      // item[1] = this is the sha1 of the image mainly used to indentify and request the image
      // item[2] = the width of the image
      // item[3] = the height of the image
    }
    home.ImgPreMake(imagesLenght)
    home.LoadImages(imagesLenght)
  } else if (data.what == 'getbasicvideos') {
    let touse = []
    for (var i = 0; i < data.data.length; i++) {
      // transform the array with data to something that's readable
      let d = data.data[i]
      touse.push({
        id: d[0],
        moviename: d[1],
        show: d[2],
        poster: d[3],
        background: d[4],
        belongs: {
          name: d[5],
          poster: d[6]
        }
      })
    }
    home.createVideoList(touse)
  }
})
