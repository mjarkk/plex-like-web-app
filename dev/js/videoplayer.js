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
    shakaloaded: false,
    movie: {
      id: '',
      mpd: ''
    }
  },
  methods: {
    loadvideo: (movieID) => {
      moviePlayer.movie.id = movieID
    },
    initPlayer: () => {
      var video = document.querySelector('#videoplayer-shaka')
      moviePlayer.player = new shaka.Player(video)
      moviePlayer.player.addEventListener('error', onErrorEvent)
      moviePlayer.player.load(moviePlayer.movie.mpd).then(() => {
        log('The video has now been loaded!')
      }).catch(onError)
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
