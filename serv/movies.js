// movies.js
// this file adds meta data to movies

var mdb = undefined
const fs = require('fs-extra')
const errHandeler = require('./errorhandeler.js')

const x = exports

// check if the the movie db api key is valid
try {
  mdb = require('moviedb')(globconf.TheMovieDbApiKey)
  x.supported = true
} catch (e) {
  log('Wrong The Movie DB API key','add it in conf/servconfig.json')
}

// search for a movie / serie
// data = {
//   query: <string (name of movie / serie)>
// }
x.search = (data, callback) => {
  dune = (returndata) =>
    (typeof callback == 'function') ?
      callback(returndata) :
      false
  if (data && typeof data.query == 'string') {
    let movies = undefined
    let series = undefined
    getmovie = () =>
      mdb.searchMovie({ query: data.query }, (err, res) => {
        movies = res
        getserie()
      })
    getserie = () =>
      mdb.searchTv({ query: data.query }, (err, res) => {
        series = res
        addup()
      })
    addup = () => {
      // finalize the data
      // TODO: add some optimalization
      dune({movies: movies,series: series})
    }
    getmovie()
  } else {
    dune(false)
  }
}
