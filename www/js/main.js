window.LoadedScripts['main'] = true

if (!WebWorker) {
  document.querySelector('.notsupportedbrowser').style.display = 'block'
}
