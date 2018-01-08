// the videoplayer file

window.LoadedScripts['videoplayer'] = true


var manifestUri = '/video/MPD/videoid/mpd';

let initApp = () => {
  shaka.polyfill.installAll();
  if (shaka.Player.isBrowserSupported()) {
    initPlayer();
  } else {
    // This browser does not have the minimum set of APIs we need.
    console.error('Browser not supported!');
  }
}

let initPlayer = () => {
  // Create a Player instance.
  var video = document.getElementById('video')
  var player = new shaka.Player(video)

  // Attach player to the window to make it easy to access in the JS console.
  window.player = player

  player.addEventListener('error', onErrorEvent)

  // Try to load a manifest.
  // This is an asynchronous process.
  player.load(manifestUri).then(() => {
    console.log('The video has now been loaded!');
  }).catch(onError)
}

onErrorEvent = (event) => {
  onError(event.detail);
}

onError = (error) => {
  console.error('Error code', error.code, 'object', error);
}

document.addEventListener('DOMContentLoaded', initApp)
