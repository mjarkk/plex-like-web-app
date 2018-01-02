// the image viewer

window.LoadedScripts['imgviewer'] = true

let htmlel = document.querySelector('.img-viewer-vue')

var imgviewer = new Vue({
  el: '.img-viewer-vue',
  data: {
    show: (htmlel.style.display == 'none') ? 'none' : 'block',
    layer1: '', // this layer includes the lowest resolution image
    layer2: '', // this layer includes a full res image but not the best quality
    layer3: '', // this layer has the full resolution and quality
    showlayer: [false,false,false],
    layer1size: 200
  },
  methods: {
    closeimgviewer: () => {
      imgviewer.show = 'none'
      imgviewer.layer1 = ''
      imgviewer.layer2 = ''
      imgviewer.layer3 = ''
      imgviewer.showlayer = [false,false,false]
    },
    showimg: (data) => {
      // data = {
      //   aspect: <number>,
      //   id: <string (sha1 of the img)>,
      //   previewurl: <string (a url that has already been loaded) (doesn't have to be included)>
      // }
      imgviewer.show = 'block'
      let imagesize = {
        height: 0,
        width: document.querySelector('.img-viewer-vue').clientWidth
      }
      imagesize.height = Math.round(imagesize.width / data.aspect)
      let showerr = (err) => {
        log(`can't show image: ${err}`)
      }
      let loadL = (id) => {
        let next = () => {
          if (id == 1) {
            imgviewer.showlayer = [true,false,false]
          } else if (id == 2) {
            imgviewer.showlayer = [false,true,false]
          } else {
            imgviewer.showlayer = [false,false,true]
          }
          if (loadmore) {
            loadL(id + 1)
          }
        }
        let toloadurl = ''
        let loadmore = true
        if (id == 1) {
          if (data.previewurl) {
            toloadurl = data.previewurl
          } else {
            toloadurl = `http://localhost:9090/image/${data.id}/60/${Math.round(data.aspect * imgviewer.layer1size)}x${imgviewer.layer1size}/false`
          }
        } else if (id == 2) {
          toloadurl = `http://localhost:9090/image/${data.id}/80/${imagesize.width}x${imagesize.height}/false`
        } else if (id == 3) {
          toloadurl = `http://localhost:9090/image/${data.id}/false/false/false`
          loadmore = false
        }
        let LoadingImg = new Image()
        LoadingImg.src = toloadurl

        imgviewer[`layer${id}`] = LoadingImg.src
        if (LoadingImg.complete) {
          next()
        } else {
          LoadingImg.onload = () => next()
          LoadingImg.onerror = () => next()
        }

      }
      imgviewer.showlayer = [false,false,false]
      if (data.id && data.aspect) {
        loadL(1)
      } else {
        showerr(data.id ? 'NO IMAGE ID DEFINED' : 'NO ASPECT DEFINED')
      }
    }
  },
  watch: {},
  created: () => setTimeout( () => {

  }, 1)
})
