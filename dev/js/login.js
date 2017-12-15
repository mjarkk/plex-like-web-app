window.LoadedScripts['login'] = true

var login = new Vue({
  el: '.login-vue',
  data: {
    showbgimg: false,
    showloginprocess: false,
    username: '',
    password: '',
    showErr: false,
    errMsg: '--'
  },
  methods: {
    trylogin: () => {
      let vm = login
      vm.showloginprocess = true
      WebWorker.postMessage({
          what: 'trylogin',
          username: vm.username,
          password: vm.password
      })
      WebWorker.addEventListener('message', (msg) => {
        if (msg.data.what == 'TryLoginStatus') {
          vm.showErr = !msg.data.status
          vm.errMsg = 'Wrong password or username!'
          vm.showloginprocess = false
        }
      })
    }
  },
  created: () => {
    let imgloader = new Image()
    imgloader.src = `https://source.unsplash.com/collection/791207/${Math.round(window.innerWidth * 1.3)}x${Math.round(window.innerHeight * 1.3)}`
    imgloader.onload = () => {
      document.querySelector('.login-vue').style.backgroundImage = `url(${imgloader.src})`
      login.showbgimg = true
    }
  }
})
