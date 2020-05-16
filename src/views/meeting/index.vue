<template>
  <div class="meeting-container">

    <el-container>
      <el-header height="214px">
        <preview />
        <preview />
        <preview />
        <preview />
        <preview />
        <preview />
        <preview />
        <preview />
        <preview />
      </el-header>
      <el-container>

        <el-main>
          <video ref="video_self" autoplay playsinline />
          <el-button @click="startV()">开始</el-button>
          <el-button @click="stopV()">停止</el-button>

          <el-button type="primary" style="margin-left: 16px;" @click="addV()">
            添加
          </el-button>

        </el-main>
        <el-aside width="300px">Aside</el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Preview from './components/Preview'
import adapter from 'webrtc-adapter'
import { getUrl } from '@/api/websocketInfo'

export default {
  name: 'Meeting',
  components: { Preview },
  data() {
    return {
      locallocalWebsocket: null,
      wsurl: null,
      localStream: undefined
    }
  },
  beforeDestroy() {
    console.log('即将销毁')
  },
  destroyed() {
    this.localWebsocket.close() // 离开路由之后断开localWebsocket连接
  },
  methods: {
    // 设置本地播放器
    startV() {
      this.initLocalWebsocket()
      var localStream
      console.log(adapter.browserDetails.browser)
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          console.log('本地播放器设置')
          localStream = mediaStream
          this.localStream = localStream
          this.$refs.video_self.srcObject = this.localStream
          console.log('本地播放器设置成功')
          var rtcPeerConnection = new RTCPeerConnection(null)
          console.log(rtcPeerConnection)
        }).catch(() => {
          console.log('失败')
        })
    },
    stopV() {
      this.localStream.getTracks().forEach(function(track) {
        track.stop()
      })
      this.localWebsocket.close()
    },
    addV() {

    },
    async  initLocalWebsocket() { // 初始化weosocket
      const response = await getUrl()
      this.wsurl = response.data
      console.log('获取到wsurl:' + this.wsurl)
      this.localWebsocket = new WebSocket(this.wsurl)
      this.localWebsocket.onmessage = this.wseReceiveMessage
      this.localWebsocket.onopen = () => {
        console.log('localWebsocket打开')
      }
      this.localWebsocket.onerror = () => {
        console.log('localWebsocket错误')
        // 重连？
      }
      this.localWebsocket.onclose = (e) => {
        console.log('localWebsocket关闭' + e)
      }
    },
    wseReceiveMessage(e) { // 数据接收
      const redata = JSON.parse(e.data)
      console.log(redata)
    },
    wsSend(Data) { // 数据发送
      this.localWebsocket.send(Data)
    }
  }

}
</script>

<style lang="scss">
  .el-header{
    background-color: #B3C0D1;
    padding: 0;
    margin: 0;
    overflow-x: scroll;
    overflow-y: hidden;
    white-space: nowrap;
  }

  .el-aside {
    background-color: #D3DCE6;
    margin: 0;
  }

  .el-main {
    background-color: #E9EEF3;

    padding: 0;
  }
  .el-container{
    height: calc(100vh - 84px)
  }

</style>
