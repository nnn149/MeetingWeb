<template>
  <div class="meeting-container">

    <el-container>
      <el-header height="214px">
        <template v-for="(client) in clients">
          <preview
            v-if="client!==undefined"
            :key="client.userId"
            :client="client"
            @pmEvent="pm"
            @microEvent="changeMicro"
            @fullEvent="fullScreen"
            @kickEvent="kick"
            @viewEvent="changeView"
          />
        </template>
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
        <el-aside width="350px">
          <Chat :receive-msg="receiveMsg" @chatEvent="sendChat" @noticeEvent="notice" />
        </el-aside>
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
import { mapGetters } from 'vuex'

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
      isRoomAdmin: false,
      clients: [{
        userId: '0',
        nickname: '未连接',
        roomId: '0',
        localStream: undefined,
        peerConnection: undefined
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
  computed: {
    ...mapGetters([
      'token',
      'name'
    ])
  },
  async mounted() {
    this.dialogFormVisible = true
    this.startV()
    var m = new MessageModel(TYPE_COMMAND_ROOM_CREATE)
    console.log(JSON.stringify(m))
    try {
      await this.initLocalWebsocket()
    } catch (e) {
      console.log('websocket错误:' + e.message)
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
            localStream: mediaStream,
            peerConnection: undefined
          }
          this.$set(this.clients, 0, c0)
          console.log('本地流')
          console.log(this.clients[0].localStream)
          console.log('本地播放器设置成功')
        }).catch((e) => {
          console.log('本地播放器设置失败 ' + e.message)
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
      msg = new MessageModel(TYPE_COMMAND_CHAT, this.roomFromDate.roomId, this.name + ': ' + msg + '\n')
      this.wsSend(msg)
    },
    receiveMsgHandle(msg) {
      // clients[0]默认就有
      const c1 = {
        userId: '11'
      }
      this.$set(this.clients, 1, c1)
      const c3 = {
        userId: '33'
      }
      this.$set(this.clients, 3, c3)
      console.log(this.clients)
    },
    createOrEnterRoom(method) { // 进入房间
      this.$refs.romeForm.validate((valid) => {
        if (valid) {
          var msg
          if (method === 'create') {
            msg = new MessageModel(TYPE_COMMAND_ROOM_CREATE, this.roomFromDate.roomId, '', '', this.roomFromDate.roomPw, this.token)
            console.log('创建房间:' + JSON.stringify(msg))
            this.wsSend(msg)
          } else {
            console.log('加入房间:' + this.roomFromDate.roomId)
            msg = new MessageModel(TYPE_COMMAND_ROOM_ENTER, this.roomFromDate.roomId, '', '', this.roomFromDate.roomPw, this.token)
            this.wsSend(msg)
          }
        } else {
          console.log('表单验证错误')
          return false
        }
      })
    },
    successHandle(message) {
      this.isInRoom = true
      this.dialogFormVisible = false
      this.clients[0].userId = message.userId
      this.clients[0].roomId = message.roomId
      this.clients[0].nickname = this.name
      if (message.message === 'create') {
        console.log('创建房间成功')
        this.isRoomAdmin = true
      } else {
        console.log('进入房间成功')
        this.isRoomAdmin = false

        // 广播 自己准备好了,其他用户收到后就会创建连接
        var msg = new MessageModel(TYPE_COMMAND_READY, this.roomFromDate.roomId, this.name, message.userId)
        console.log('发送准备完毕广播' + msg)
        this.wsSend(msg)
        this.$message.success('成功!')
      }
    },
    readyHandle(message) { // 收到上线的用户准备好信号，创建RTCPeerConnectio准备与他连接并发送offer
      var rtcPeerConnection = new RTCPeerConnection(iceServers)
      rtcPeerConnection.userId = message.userId

      for (const track of this.clients[0].localStream.getTracks()) {
        rtcPeerConnection.addTrack(track, this.clients[0].localStream)
      }

      rtcPeerConnection.ontrack = this.onTrack
      rtcPeerConnection.onicecandidate = this.onIceCandidate
      var remoteClient = {
        userId: message.userId,
        roomId: message.roomId,
        nickname: message.message,
        localStream: undefined,
        peerConnection: rtcPeerConnection
      }
      this.$set(this.clients, Number(message.userId), remoteClient)
      console.log('准备完毕,添加了一个连接')
      console.log(this.clients)
      console.log('创建offer')
      rtcPeerConnection.createOffer(offerOptions).then((description) => {
        console.log('创建offer,设置本地Description')
        console.log(description)
        rtcPeerConnection.setLocalDescription(description)
        var msg = new MessageModel(TYPE_COMMAND_OFFER, this.clients[0].roomId, this.messageDateToString(description), message.userId, this.name) // 字段不够用,把名字临时放在roomPw字段
        console.log('发送offer')
        this.wsSend(msg)
      }).catch()
    },
    offerHandle(message) {
      var rtcPeerConnection = new RTCPeerConnection(iceServers)
      rtcPeerConnection.userId = message.userId
      console.log('本地流')
      console.log(this.clients[0].localStream)
      for (const track of this.clients[0].localStream.getTracks()) {
        rtcPeerConnection.addTrack(track, this.clients[0].localStream)
      }

      rtcPeerConnection.ontrack = this.onTrack
      rtcPeerConnection.onicecandidate = this.onIceCandidate
      var remoteClient = {
        userId: message.userId,
        roomId: message.roomId,
        nickname: message.roomPw,
        localStream: undefined,
        peerConnection: rtcPeerConnection
      }
      this.$set(this.clients, Number(message.userId), remoteClient)
      console.log('接受到offer,添加了一个连接')
      console.log(this.clients)
      var sdp = JSON.parse(message.message)
      rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(sdp))
        .then(
          console.log('收到offer,设置远程Description 完毕')
        )
      rtcPeerConnection.createAnswer(offerOptions)
        .then((description) => {
          console.log('创建answer,设置本地Description')
          rtcPeerConnection.setLocalDescription(description)
          var msg = new MessageModel(TYPE_COMMAND_ANSWER, this.clients[0].roomId, this.messageDateToString(description), message.userId)
          // console.log('发送answer:' + JSON.stringify(msg))
          this.wsSend(msg)
        })
        .catch(() => {
          console.log('创建answer,设置本地AndAnswer 错误')
        }
        )
    },
    answerHandle(message) {
      this.clients[Number(message.userId)].peerConnection.setRemoteDescription(JSON.parse(message.message)).then(
        console.log('收到answer,设置远程描述完毕')
      )
      // this.$set(this.clients[Number(message.userId)], 'peerConnection', this.clients[Number(message.userId)].peerConnection)
    },
    onIceCandidate(event) {
      console.log('onIceCandidate')
      // console.log(event)
      if (event.candidate === null) {
        console.log('Candidata为null')
        return
      }
      var msg = new MessageModel(TYPE_COMMAND_CANDIDATE, this.clients[0].roomId, this.messageDateToString(event.candidate), event.target.userId)
      // console.log('发送Candidate:' + JSON.stringify(msg))
      this.wsSend(msg)
    },
    candidateHandle(message) {
      console.log('收到Candidata')
      console.log(message)
      console.log(this.clients)
      var newIceCandidata = new RTCIceCandidate(JSON.parse(message.message))
      this.clients[Number(message.userId)].peerConnection.addIceCandidate(newIceCandidata)
        .then(console.log('添加Candidata成功')).catch((error) => { console.log('添加Candidata失败:' + error) })
    },
    onTrack(event) {
      console.log('收到数据流' + event.target.userId)
      this.clients[Number(event.target.userId)].localStream = event.streams[0]
    },
    closeView() {
      if (this.isInRoom === false) {
        this.$router.go(-1)
      }
    },
    async initLocalWebsocket() {
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
      console.log('数据接收:')
      console.log(e.data)
      var str = e.data.toString().replace(/!@#/g, '')
      const message = JSON.parse(str)
      switch (message.command) {
        case TYPE_COMMAND_SUCCESS:
          this.successHandle(message)
          break
        case TYPE_COMMAND_ERROR:
          this.$message.error(message.message)
          break
        case TYPE_COMMAND_CHAT:
          this.receiveMsg = message.message
          break
        case TYPE_COMMAND_READY:
          this.readyHandle(message)
          break
        case TYPE_COMMAND_OFFER:
          message.message
          this.offerHandle(message)
          break
        case TYPE_COMMAND_ANSWER:
          this.answerHandle(message)
          break
        case TYPE_COMMAND_CANDIDATE:
          this.candidateHandle(message)
          break
      }
    },
    wsSend(data) { // 数据发送
      this.localWebsocket.send(JSON.stringify(data))
    },
    messageDateToString(data) { // 如果message字段是对象，就把他变成字符串，这样服务器解析不会报错
      return '!@#' + JSON.stringify(data) + '!@#'
    }

  }

}

class MessageModel {
  constructor(command, roomId, message, userId, roomPw, token) {
    this.command = command
    this.userId = userId
    this.roomId = roomId
    this.message = message
    this.roomPw = roomPw
    this.token = token
  }
}

const TYPE_COMMAND_ROOM_ENTER = 'enterRoom'
const TYPE_COMMAND_ROOM_CREATE = 'createRoom'
const TYPE_COMMAND_ROOM_LIST = 'roomList'
const TYPE_COMMAND_PM = 'pm'
const TYPE_COMMAND_READY = 'ready'
const TYPE_COMMAND_OFFER = 'offer'
const TYPE_COMMAND_ANSWER = 'answer'
const TYPE_COMMAND_CANDIDATE = 'candidate'

const TYPE_COMMAND_ERROR = 'error'
const TYPE_COMMAND_SUCCESS = 'success'
const TYPE_COMMAND_CHAT = 'chat'

const iceServers = {
  'iceServers': [
    { url: 'stun:stun.ekiga.net' },
    { url: 'stun:stun.ideasip.com' }
  ]
}
const offerOptions = {
  iceRestart: true,
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
}
</script>

<style lang="scss">
  .el-header {
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

  .el-container {
    height: calc(100vh - 84px)
  }

</style>
