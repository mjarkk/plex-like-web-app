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

WebWorker.addEventListener('message', (msg) => {
  const data = msg.data
  if (msg.data.what == 'TryLoginStatus') {
    login.showloginprocess = false
    login.showErr = !data.status
    if (!data.status) {
      login.errMsg = 'Wrong password or username!'
    } else {
      document.querySelector('.home-vue').style.display = 'flex'
      const keys = data.status
      localStorage.setItem('PBKF2password', keys.PBKF2password)
      localStorage.setItem('key', keys.key)
      localStorage.setItem('username', keys.username)
      reqfile('home', () => {
        log('logedin')
      })
    }
  }
})
