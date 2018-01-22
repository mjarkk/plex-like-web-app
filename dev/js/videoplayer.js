// the videoplayer file
window.LoadedScripts['videoplayer'] = true

let initApp = () => {
  shaka.polyfill.installAll()
  if (shaka.Player.isBrowserSupported()) {
    moviePlayer.shakaloaded = true
  } else {
    log('Browser not supported!')
  }
}

var moviePlayer = new Vue({
  el: '.videoplayer-vue',
  data: {
    player: {},
    control: {
      paused: false
    },
    shakaloaded: false,
    movie: {
      id: '',
      mpd: ''
    }
  },
  methods: {
    timelineclick: (ev) => {
      let progressBar = document.querySelector('.slider .holder')
      let newpos = 100 / progressBar.offsetWidth * (ev.pageX - progressBar.offsetLeft)
      let videl = document.querySelector('#videoplayer-shaka')
      let ispaused = videl.paused
      if (!ispaused) {
        videl.pause()
      }
      videl.currentTime = videl.duration / 100 * newpos
      if (!ispaused) {
        videl.play()
      }
    },
    updatetimeline: () => {
      let videl = document.querySelector('#videoplayer-shaka')
      let pos = 100 / videl.duration * videl.currentTime
      let progressBar = document.querySelector('.slider .holder')
      let PBW = progressBar.offsetWidth // pbw = progess bar width
      progressBar.querySelector('.process').style.left = ((PBW / 100 * pos) - 8) + 'px'
    },
    play: () => {
      document.querySelector('#videoplayer-shaka').play()
      moviePlayer.update()
    },
    pause: () => {
      document.querySelector('#videoplayer-shaka').pause()
      moviePlayer.update()
    },
    update: () => {
      let vidplayer = document.querySelector('#videoplayer-shaka')
      moviePlayer.control.paused = vidplayer.paused
    },
    loadvideo: (movieID) => {
      moviePlayer.movie.id = movieID
    },
    initPlayer: () => {
      var video = document.querySelector('#videoplayer-shaka')
      moviePlayer.player = new shaka.Player(video)
      moviePlayer.player.addEventListener('error', onErrorEvent)
      moviePlayer.player.load(moviePlayer.movie.mpd).then(() => {
        setTimeout(() => {
          moviePlayer.update()
        }, 100)
      }).catch(onError)
      video.ontimeupdate = (e) => moviePlayer.updatetimeline()
    }
  },
  watch: {
    'movie.id': (newval) => {
      moviePlayer.movie.mpd = `/video/MPD/${newval}/mpd`
      if (moviePlayer.shakaloaded) {
        moviePlayer.initPlayer()
      }
    }
  },
  created: () => setTimeout( () => {

  }, 1)
})


onErrorEvent = (event) => {
  onError(event.detail)
}

onError = (error) => {
  log('Error code', error.code, 'object', error)
}

initApp()
