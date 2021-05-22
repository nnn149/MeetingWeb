<template>
  <div class="meeting-container">

    <el-container>
      <el-header height="214px">
        <template v-for="(client) in clients">
          <preview
            v-if="client!==undefined"
            :key="client.userId"
            :client="client"
            :is-room-admin="clients[0].isRoomAdmin"
            @banEvent="ban"
            @microEvent="changeMicro"
            @fullEvent="fullScreen"
            @kickEvent="kick"
            @viewEvent="changeView"
            @changeStreamEvent="changeStream"
          />
        </template>
      </el-header>
      <el-container>
        <el-main>
          <div style="text-align: center ;height: calc(100vh - 300px);width: 100%">
            <video ref="video_full" style="height:100%" muted autoplay playsinline />
          </div>
        </el-main>
        <el-aside width="350px">
          <Chat :receive-msg="receiveMsg" @chatEvent="sendChat" @noticeEvent="notice" />
          <div style="text-align: center;margin-top: 10px">
            <el-button v-if="clients[0].isRoomAdmin" type="danger" round size="mini" @click="changeView('')">
              <span v-show="isView">
                全体禁视
              </span>
              <span v-show="!isView">
                取消禁视
              </span>
            </el-button>
            <el-button v-if="clients[0].isRoomAdmin" type="danger" round size="mini" @click="changeMicro('')">
              <span v-show="!isMuted">
                全体禁音
              </span>
              <span v-show="isMuted">
                取消禁音
              </span></el-button>
            <el-button v-if="clients[0].isRoomAdmin" type="danger" round size="mini" @click="ban('')">
              <span v-show="!isBan">
                全体禁言
              </span>
              <span v-show="isBan">
                取消禁言
              </span></el-button>

          </div>
        </el-aside>
      </el-container>
    </el-container>

    <el-dialog title="请输入房间号和密码：" :visible.sync="dialogFormVisible" @close="closeView">
      <el-form ref="romeForm" :model="roomFromDate" status-icon :rules="roomFromRules" label-width="100px">
        <el-form-item label="昵称:" prop="nickname">
          <el-input v-model="roomFromDate.nickname" maxlength="20" autocomplete="off" />
        </el-form-item>
        <el-form-item label="房间号:" prop="roomId">
          <el-input v-model="roomFromDate.roomId" maxlength="10" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码:" prop="roomPw">
          <el-input v-model="roomFromDate.roomPw" type="password" maxlength="10" autocomplete="off" />
        </el-form-item>
        <el-form-item label="视频来源:" prop="roomPw">
          <el-radio v-model="roomFromDate.radio" label="1">摄像头</el-radio>
          <el-radio v-model="roomFromDate.radio" label="2">电脑屏幕</el-radio>
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
import store from '@/store'
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
      meetingId: '0',
      dialogFormVisible: false,
      localWebsocket: undefined,
      wsUrl: undefined,
      receiveMsg: '',
      isInRoom: false,
      isBan: false,
      isView: true,
      isMuted: false,
      fullScreenId: '',
      clients: [{
        userId: '0',
        nickname: '未连接',
        roomId: '0',
        localStream: undefined,
        peerConnection: undefined,
        muted: false,
        view: true,
        chat: true,
        isSelf: false,
        isRoomAdmin: false,
        nowStream: 'screen'
      }],
      roomFromDate: {
        nickname: '',
        roomId: '',
        roomPw: '',
        radio: '2'
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
    this.roomFromDate.nickname = this.name
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
    if (this.isInRoom) {
      const msg = new MessageModel(TYPE_COMMAND_KICK, this.roomFromDate.roomId, '', this.clients[0].userId)
      this.wsSend(msg)
    }
    if (this.localWebsocket !== undefined) {
      this.localWebsocket.close() // 离开路由之后断开localWebsocket连接
    }
    this.stopV()
  },

  methods: {
    // 设置本地播放器
    async startV() {
      if (this.roomFromDate.radio === '2') {
        console.log(adapter.browserDetails.browser)
        var mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints)
        var audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        console.log('本地播放器设置')
        const c0 = {
          userId: '0',
          roomId: '0',
          nickname: '未连接',
          localStream: mediaStream,
          peerConnection: undefined,
          muted: false,
          view: true,
          chat: true,
          isSelf: true,
          isRoomAdmin: false,
          nowStream: 'screen'
        }
        c0.localStream.addTrack(audioStream.getAudioTracks()[0])
        this.$set(this.clients, 0, c0)
        console.log('本地流')
        console.log(this.clients[0].localStream)
        console.log('本地播放器设置成功')
      } else {
        console.log(adapter.browserDetails.browser)
        var audioStream1 = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        console.log('摄像头设置')
        const c01 = {
          userId: '0',
          roomId: '0',
          nickname: '未连接',
          localStream: audioStream1,
          peerConnection: undefined,
          muted: false,
          view: true,
          chat: true,
          isSelf: true,
          isRoomAdmin: false,
          nowStream: 'screen'
        }
        this.$set(this.clients, 0, c01)
        console.log('本地流')
        console.log(this.clients[0].localStream)
        console.log('本地摄像头设置成功')
      }
    },
    stopV() {
      this.clients[0].localStream.getTracks().forEach(function(track) {
        track.stop()
      })
    },
    addV() {
      navigator.mediaDevices.getDisplayMedia({ constraints }).then(stream => {
        this.clients[0].localStream = stream
      }).catch(error => {
        console.log(error)
      })
    },
    async changeStream(userId) {
      if (this.clients[0].nowStream === 'screen') {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then((mediaStream) => {
            this.stopV()
            console.log('切换为摄像头')
            this.clients[0].localStream = mediaStream
            console.log('本地摄像头设置成功')
          }).catch((e) => {
            console.log('本地摄像头设置失败 ' + e.message)
          })
        this.clients[0].nowStream = 'camera'
      } else {
        this.stopV()
        var mediaStream = await navigator.mediaDevices.getDisplayMedia(constraints)
        var audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        console.log('切换为屏幕')
        this.clients[0].localStream = mediaStream
        this.clients[0].localStream.addTrack(audioStream.getAudioTracks()[0])
        console.log('本地播放器设置成功')
        this.clients[0].nowStream = 'screen'
      }
    },
    ban(userId) {
      console.log('ban:' + userId)
      if (userId === '') { // 全体禁言
        if (this.isBan) { // 恢复
          const msg = new MessageModel(TYPE_COMMAND_BAN, this.roomFromDate.roomId, 'false', '')
          this.wsSend(msg)
        } else {
          // 全体禁言
          const msg = new MessageModel(TYPE_COMMAND_BAN, this.roomFromDate.roomId, 'true', '')
          this.wsSend(msg)
        }
      } else {
        if (this.clients[userId].chat) { // 全员发送chat关闭
          const msg = new MessageModel(TYPE_COMMAND_BAN, this.roomFromDate.roomId, 'true', userId)
          this.wsSend(msg)
        } else { // 全员发送chat开启
          const msg = new MessageModel(TYPE_COMMAND_BAN, this.roomFromDate.roomId, 'false', userId)
          this.wsSend(msg)
        }
      }
    },
    changeMicro(userId) {
      console.log('changeMicro:' + userId)
      if (userId === '') {
        if (this.isMuted) {
          const msg = new MessageModel(TYPE_COMMAND_MUTED, this.roomFromDate.roomId, 'false', '')
          this.wsSend(msg)
        } else {
          const msg = new MessageModel(TYPE_COMMAND_MUTED, this.roomFromDate.roomId, 'true', '')
          this.wsSend(msg)
        }
      } else {
        if (userId === this.clients[0].userId) { // 自己开关麦克风，通知所有人
          if (this.clients[0].muted) {
            // 打开麦克风
            const msg = new MessageModel(TYPE_COMMAND_MUTED, this.roomFromDate.roomId, 'false', this.clients[0].userId)
            this.wsSend(msg)
          } else {
            // 关闭麦克风
            const msg = new MessageModel(TYPE_COMMAND_MUTED, this.roomFromDate.roomId, 'true', this.clients[0].userId)
            this.wsSend(msg)
          }
        } else { // 别人
          if (this.clients[0].isRoomAdmin) { // 自己是管理员，就要彻底开关他的麦克风
            if (this.clients[Number(userId)].muted) {
              // 通知所有人打开此人麦克风
              const msg = new MessageModel(TYPE_COMMAND_MUTED, this.roomFromDate.roomId, 'false', userId)
              this.wsSend(msg)
            } else {
              // 通知所有人关闭此人麦克风
              const msg = new MessageModel(TYPE_COMMAND_MUTED, this.roomFromDate.roomId, 'true', userId)
              this.wsSend(msg)
            }
          } else {
            if (this.clients[Number(userId)].muted) {
              this.clients[Number(userId)].muted = false
            } else {
              this.clients[Number(userId)].muted = true
            }
          }
        }
      }
    },
    fullScreen(userId) {
      console.log('fullScreen:' + userId)
      if (userId === this.clients[0].userId) {
        this.$refs.video_full.srcObject = this.clients[0].localStream
        this.fullScreenId = '0'
      } else {
        this.$refs.video_full.srcObject = this.clients[userId].localStream
        this.fullScreenId = userId
      }
    },
    kick(userId) {
      console.log('kick:' + userId)
      const msg = new MessageModel(TYPE_COMMAND_KICK, this.roomFromDate.roomId, '', userId)
      this.wsSend(msg)
    },
    changeView(userId) {
      console.log('changeView:' + userId)
      if (userId === '') {
        if (this.isView) {
          const msg = new MessageModel(TYPE_COMMAND_VIEW, this.roomFromDate.roomId, 'false', '')
          this.wsSend(msg)
        } else {
          const msg = new MessageModel(TYPE_COMMAND_VIEW, this.roomFromDate.roomId, 'true', '')
          this.wsSend(msg)
        }
      } else {
        if (userId === this.clients[0].userId) { // 自己开关视频，通知所有人
          if (this.clients[0].view) {
            // 打开视频
            const msg = new MessageModel(TYPE_COMMAND_VIEW, this.roomFromDate.roomId, 'false', this.clients[0].userId)
            this.wsSend(msg)
          } else {
            // 关闭视频
            const msg = new MessageModel(TYPE_COMMAND_VIEW, this.roomFromDate.roomId, 'true', this.clients[0].userId)
            this.wsSend(msg)
          }
        } else { // 别人
          if (this.clients[0].isRoomAdmin) { // 自己是管理员，就要彻底开关他的视频
            if (this.clients[Number(userId)].view) {
              // 通知所有人打开此人视频
              const msg = new MessageModel(TYPE_COMMAND_VIEW, this.roomFromDate.roomId, 'false', userId)
              this.wsSend(msg)
            } else {
              // 通知所有人关闭此人视频
              const msg = new MessageModel(TYPE_COMMAND_VIEW, this.roomFromDate.roomId, 'true', userId)
              this.wsSend(msg)
            }
          } else {
            if (this.clients[Number(userId)].view) {
              this.clients[Number(userId)].view = false
              if (this.fullScreenId !== '0') {
                this.$refs.video_full.srcObject = null
              }
            } else {
              this.clients[Number(userId)].view = true
            }
          }
        }
      }
    },
    notice(msg) {
      console.log('notice:' + msg)
    },
    sendChat(msg) {
      console.log('sendChat:' + msg)
      if (!this.clients[0].chat) {
        this.$message.error('已被禁言...')
        return
      }
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
            msg = new MessageModel(TYPE_COMMAND_ROOM_CREATE, this.roomFromDate.roomId, this.roomFromDate.nickname, '', this.roomFromDate.roomPw, this.token)
            console.log('创建房间:' + JSON.stringify(msg))
            this.wsSend(msg)
          } else {
            console.log('加入房间:' + this.roomFromDate.roomId)
            msg = new MessageModel(TYPE_COMMAND_ROOM_ENTER, this.roomFromDate.roomId, this.roomFromDate.nickname, '', this.roomFromDate.roomPw, this.token)
            this.wsSend(msg)
          }
        } else {
          console.log('表单验证错误')
          return false
        }
      })
    },
    successHandle(message) {
      store.dispatch('user/setNickname', this.roomFromDate.nickname)
      this.startV().then(() => {
        this.isInRoom = true
        this.dialogFormVisible = false
        this.clients[0].userId = message.userId
        this.clients[0].roomId = message.roomId
        this.clients[0].nickname = this.name
        if (message.message === 'create') {
          console.log('创建房间成功')
          this.clients[0].isRoomAdmin = true
        } else {
          console.log('进入房间成功')
          this.clients[0].isRoomAdmin = false
        }
        // 广播 自己准备好了,其他用户收到后就会创建连接
        var msg = new MessageModel(TYPE_COMMAND_READY, this.roomFromDate.roomId, this.name, message.userId, '', this.clients[0].isRoomAdmin)
        console.log('发送准备完毕广播' + msg)
        this.wsSend(msg)
        this.$message.success('成功!')
      })
    },
    readyHandle(message) { // 收到上线的用户准备好信号，创建RTCPeerConnectio准备与他连接并发送offer
      if (this.clients[0].userId === message.userId) { // 是自己准备好了

      } else {
        var rtcPeerConnection = new RTCPeerConnection(iceServers)
        rtcPeerConnection.userId = message.userId
        for (const track of this.clients[0].localStream.getTracks()) {
          rtcPeerConnection.addTrack(track, this.clients[0].localStream)
        }
        rtcPeerConnection.ontrack = this.onTrack
        rtcPeerConnection.onicecandidate = this.onIceCandidate
        const remoteClient = {
          userId: message.userId,
          roomId: message.roomId,
          nickname: message.message,
          localStream: undefined,
          peerConnection: rtcPeerConnection,
          muted: false,
          view: true,
          chat: true,
          isSelf: false,
          isRoomAdmin: JSON.parse(message.token),
          nowStream: 'screen'
        }
        this.$set(this.clients, Number(message.userId), remoteClient)
        console.log('准备完毕,添加了一个连接')
        console.log(this.clients)
        console.log('创建offer')
        rtcPeerConnection.createOffer(offerOptions).then((description) => {
          console.log('创建offer,设置本地Description')
          console.log(description)
          rtcPeerConnection.setLocalDescription(description)
          var msg = new MessageModel(TYPE_COMMAND_OFFER, this.clients[0].roomId, this.messageDateToString(description), message.userId, this.name, this.clients[0].isRoomAdmin) // 字段不够用,把名字临时放在roomPw字段
          console.log('发送offer')
          this.wsSend(msg)
        }).catch()
      }
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
      const remoteClient = {
        userId: message.userId,
        roomId: message.roomId,
        nickname: message.roomPw,
        localStream: undefined,
        peerConnection: rtcPeerConnection,
        muted: false,
        view: true,
        chat: true,
        isSelf: false,
        isRoomAdmin: JSON.parse(message.token),
        nowStream: 'screen'
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
      // console.log(message)
      // console.log(this.clients)
      var newIceCandidata = new RTCIceCandidate(JSON.parse(message.message))
      this.clients[Number(message.userId)].peerConnection.addIceCandidate(newIceCandidata)
        .then(console.log('添加Candidata成功')).catch((error) => {
          console.log('添加Candidata失败:' + error)
        })
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
        case TYPE_COMMAND_VIEW:
          this.viewHandle(message)
          break
        case TYPE_COMMAND_MUTED:
          this.mutedHandle(message)
          break
        case TYPE_COMMAND_BAN:
          this.banHandle(message)
          break
        case TYPE_COMMAND_KICK:
          this.kickHandle(message)
          break
      }
    },
    viewHandle(message) {
      if (message.userId === '') {
        if (message.message === 'true') {
          // 全体开启视频
          this.isView = true
          this.clients.forEach(c => {
            if (c !== undefined && !c.isRoomAdmin) {
              c.view = true
            }
          })
        } else {
          // 全体关闭视频
          if (this.fullScreenId !== '0') {
            this.$refs.video_full.srcObject = null
          }
          this.isView = false
          this.clients.forEach(c => {
            if (c !== undefined && !c.isRoomAdmin) {
              c.view = false
            }
          })
        }
      } else {
        if (message.userId === this.clients[0].userId) {
          if (message.message === 'true') {
            this.clients[0].view = true
            this.clients[0].localStream.getVideoTracks()[0].enabled = true
          } else {
            this.clients[0].view = false
            this.clients[0].localStream.getVideoTracks()[0].enabled = false
            if (this.fullScreenId === '0') {
              this.$refs.video_full.srcObject = null
            }
          }
        } else {
          if (message.message === 'true') {
            this.clients[Number(message.userId)].view = true
          } else {
            this.clients[Number(message.userId)].view = false
            if (this.fullScreenId === message.userId) {
              this.$refs.video_full.srcObject = null
            }
          }
        }
      }
    },
    mutedHandle(message) {
      if (message.userId === '') {
        if (message.message === 'true') {
          // 全体静音
          this.isMuted = true
          this.clients.forEach(c => {
            if (c !== undefined && !c.isRoomAdmin) {
              c.muted = true
            }
          })
        } else {
          // 全体取消静音
          this.isMuted = false
          this.clients.forEach(c => {
            if (c !== undefined && !c.isRoomAdmin) {
              c.muted = false
            }
          })
        }
      } else {
        if (message.userId === this.clients[0].userId) {
          if (message.message === 'true') {
            this.clients[0].muted = true
            this.clients[0].localStream.getAudioTracks()[0].enabled = false
          } else {
            this.clients[0].muted = false
            this.clients[0].localStream.getAudioTracks()[0].enabled = true
          }
        } else {
          if (message.message === 'true') {
            this.clients[Number(message.userId)].muted = true
          } else {
            this.clients[Number(message.userId)].muted = false
          }
        }
      }
    }, banHandle(message) {
      if (message.userId === '') {
        if (message.message === 'true') {
          // 全体禁言
          this.isBan = true
          this.clients.forEach(c => {
            if (c !== undefined && !c.isRoomAdmin) {
              c.chat = false
            }
          })
        } else {
          // 全体取消禁言
          this.isBan = false
          this.clients.forEach(c => {
            if (c !== undefined && !c.isRoomAdmin) {
              c.chat = true
            }
          })
        }
      } else {
        if (message.userId === this.clients[0].userId) {
          if (message.message === 'true') {
            this.clients[0].chat = false
          } else {
            this.clients[0].chat = true
          }
        } else {
          if (message.message === 'true') {
            this.clients[Number(message.userId)].chat = false
          } else {
            this.clients[Number(message.userId)].chat = true
          }
        }
      }
    }, kickHandle(message) {
      if (message.userId === this.clients[0].userId) {
        this.$message.error('您被踢出会议!')
        this.$router.go(-1)
      } else {
        this.clients[Number(message.userId)].peerConnection.close()
        this.clients.splice(Number(message.userId), 1)
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
const TYPE_COMMAND_READY = 'ready'
const TYPE_COMMAND_OFFER = 'offer'
const TYPE_COMMAND_ANSWER = 'answer'
const TYPE_COMMAND_CANDIDATE = 'candidate'

const TYPE_COMMAND_ERROR = 'error'
const TYPE_COMMAND_SUCCESS = 'success'
const TYPE_COMMAND_CHAT = 'chat'

const TYPE_COMMAND_MUTED = 'MUTED'
const TYPE_COMMAND_VIEW = 'VIEW'
const TYPE_COMMAND_BAN = 'BAN'
const TYPE_COMMAND_KICK = 'KICK'

// const TYPE_COMMAND_SIGN = 'SIGN'

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
const constraints = {
  audio: true,
  video: true
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
