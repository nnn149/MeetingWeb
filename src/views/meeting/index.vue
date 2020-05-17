<template>
  <div class="meeting-container">

    <el-container>
      <el-header height="214px">
        <preview v-for="client in clients" :key="client.userId" :client="client" @pmEvent="pm" @microEvent="changeMicro" @fullEvent="fullScreen" @kickEvent="kick" @viewEvent="changeView" />
      </el-header>
      <el-container>
        <el-main>
          <video ref="video_full" autoplay playsinline />
          <el-button @click="startV()">开始</el-button>
          <el-button @click="stopV()">停止</el-button>

          <el-button type="primary" style="margin-left: 16px;" @click="addV">
            添加
          </el-button>

        </el-main>
        <el-aside width="350px"><Chat :receive-msg="receiveMsg" @chatEvent="sendChat" @noticeEvent="notice" /></el-aside>
      </el-container>
    </el-container>

    <el-dialog title="请输入房间号和密码：" :visible.sync="dialogFormVisible" @close="closeView">
      <el-form ref="romeForm" :model="roomFromDate" status-icon :rules="roomFromRules" label-width="100px">
        <el-form-item label="房间号:" prop="roomId">
          <el-input v-model="roomFromDate.roomId" maxlength="10" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码:" prop="roomPw">
          <el-input v-model="roomFromDate.roomPw" type="password" maxlength="10" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="createOrEnterRoom('enter')">加 入</el-button>
          <el-button type="primary" @click="createOrEnterRoom('create')">创 建</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
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
    var valiRoomId = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入5-10位纯数字'))
      } else {
        var reg = /^\d{5,10}$/
        if (!reg.test(value)) {
          return callback(new Error('请输入5-10位纯数字'))
        }
        callback()
      }
    }
    return {
      dialogFormVisible: false,
      localWebsocket: undefined,
      wsUrl: undefined,
      receiveMsg: '',
      isInRoom: false,
      clients: [{
        userId: '0',
        roomId: '0',
        localStream: undefined
      }],
      roomFromDate: {
        roomId: '',
        roomPw: ''
      },
      roomFromRules: {
        roomId: [
          { validator: valiRoomId, trigger: 'blur' }
        ],
        roomPw: [
          { validator: valiRoomId, trigger: 'blur' }
        ]
      }
    }
  },
  async mounted() {
    this.dialogFormVisible = true
    try {
      await this.initLocalWebsocket()
    } catch (e) {
      console.log('websocket错误:' + e.message())
      this.$message.error('网络连接错误!')
      this.closeView()
    }
  },
  beforeDestroy() {
    console.log('即将销毁')
  },
  destroyed() {
    if (this.localWebsocket !== undefined) {
      this.localWebsocket.close() // 离开路由之后断开localWebsocket连接
    }
  },
  methods: {
    // 设置本地播放器
    startV() {
      console.log(adapter.browserDetails.browser)
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          console.log('本地播放器设置')
          const c0 = {
            userId: '0',
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
      this.$refs.video_full.srcObject = this.clients[userId].localStream
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
    createOrEnterRoom(method) {
      this.$refs.romeForm.validate((valid) => {
        if (valid) {
          if (method === 'create') {
            console.log('创建房间:' + this.roomFromDate.roomId)
          } else {
            console.log('加入房间:' + this.roomFromDate.roomId)
          }
        } else {
          console.log('表单验证错误')
          return false
        }
      })
    },
    closeView() {
      if (this.isInRoom === false) {
        this.$router.go(-1)
      }
    },
    async  initLocalWebsocket() {
      console.log('初始化weosocket')
      const response = await getUrl()
      this.wsUrl = response.data
      console.log('获取到wsurl:' + this.wsUrl)
      this.localWebsocket = new WebSocket(this.wsUrl)
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
