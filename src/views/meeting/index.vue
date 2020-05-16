<template>
  <div class="meeting-container">

    <el-container>
      <el-header height="214px">
        <preview v-for="client in clients" :key="client.userId" :client="client" @pmEvent="pm" @microEvent="changeMicro" @fullEvent="fullScreen" @kickEvent="kick" @viewEvent="changeView" />
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
        <el-aside width="350px"><Chat :receive-msg="receiveMsg" @chatEvent="sendChat" @noticeEvent="notice" /></el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import Preview from './components/Preview'
import Chat from './components/Chat'
import adapter from 'webrtc-adapter'
import { getUrl } from '@/api/websocketInfo'

export default {
  name: 'Meeting',
  components: { Preview, Chat },
  data() {
    return {
      localWebsocket: undefined,
      wsurl: undefined,
      receiveMsg: '',
      clients: [{
        userId: '0',
        roomId: '0',
        localStream: undefined
      }]
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
      console.log(adapter.browserDetails.browser)
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          console.log('本地播放器设置')
          const c0 = {
            userId: '00',
            roomId: '0',
            localStream: mediaStream
          }
          this.$set(this.clients, 0, c0)

          const c1 = {
            userId: '1',
            roomId: '1',
            localStream: mediaStream
          }
          this.$set(this.clients, 1, c1)

          console.log(this.clients)
          console.log('本地播放器设置成功')
          var rtcPeerConnection = new RTCPeerConnection(null)
          console.log(rtcPeerConnection)
        }).catch((e) => {
          console.log('失败 ' + e.message)
        })
    },
    stopV() {
      this.localStream.getTracks().forEach(function(track) {
        track.stop()
      })
      this.localWebsocket.close()
    },
    addV() {
      this.receiveMsgHandle()
    },
    pm(userId) {
      console.log('pm:' + userId)
    },
    changeMicro(userId) {
      console.log('changeMicro:' + userId)
    },
    fullScreen(userId) {
      console.log('fullScreen:' + userId)
    },
    kick(userId) {
      console.log('kick:' + userId)
    },
    changeView(userId) {
      console.log('changeView:' + userId)
    },
    notice(msg) {
      console.log('notice:' + msg)
    },
    sendChat(msg) {
      console.log('sendChat:' + msg)
    },
    receiveMsgHandle(msg) {
      this.receiveMsg = 'nnn:' + new Date()
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
    padding-top: 8px;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 20px;
  }

  .el-main {
    background-color: #E9EEF3;

    padding: 0;
  }
  .el-container{
    height: calc(100vh - 84px)
  }

</style>
