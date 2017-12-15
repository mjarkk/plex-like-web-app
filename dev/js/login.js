window.LoadedScripts['login'] = true

var login = new Vue({
  el: '.login-vue',
  data: {
    showbgimg: false,
    showloginprocess: false,
    username: '',
    password: ''
  },
  methods: {
    trylogin: () => {
      let vm = this
      fetch('/getsalt', {
        method: 'post',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cache': 'no-cache'
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          username: vm.username
        })
      })
      .then((res) => res.json())
      .then((jsondata) => {
        log(jsondata)
      })
      .catch((err) => {
        vm.showloginprocess = true
      })
    }
  },
  created: () => {

  }
})

let imgloader = new Image()
imgloader.src = `https://source.unsplash.com/collection/791207/${Math.round(window.innerWidth * 1.3)}x${Math.round(window.innerHeight * 1.3)}`
imgloader.onload = () => {
  document.querySelector('.login-vue').style.backgroundImage = `url(${imgloader.src})`
  login.showbgimg = true
}
