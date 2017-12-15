window.LoadedScripts['main'] = true
let WebWorker
if(typeof(Worker) !== 'undefined') {
    if(typeof(WebWorker) == 'undefined') {
        WebWorker = new Worker('/js/worker.js')
    }
    WebWorker.onmessage = (event) => {
      // event.data
    }
} else {
  // stuppit browser
}
