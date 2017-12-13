window.LoadedScripts['login'] = true

var login = new Vue({
  el: '.login-vue',
  data: {
    showbgimg: false
  },
  methods: {
    trylogin: () => {
      log('login thingy fired')
    }
  },
  created: () => {
    let imgloader = new Image(window.innerHeight, window.innerWidth)
    imgloader.onload = () => {
      document.querySelector('.login-vue').style.backgroundImage = `url(${imgloader.src})`
      login.showbgimg = true
    }
    imgloader.src = `https://source.unsplash.com/collection/791207/${Math.round(window.innerWidth * 1.3)}x${Math.round(window.innerHeight * 1.3)}`
  }
})
