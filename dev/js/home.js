window.LoadedScripts['home'] = true
document.querySelector('.home-vue').style.display = 'flex'
var home = new Vue({
  el: '.home-vue',
  data: {
    appname: ''
  }
})
