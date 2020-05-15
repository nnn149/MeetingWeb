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

export default {
  name: 'Meeting',
  components: { Preview },
  data() {
    return {

      localStream: undefined
    }
  },
  beforeDestroy() {
    console.log('即将销毁')
  },
  methods: {
    // 设置本地播放器
    startV() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          console.log('本地播放器设置')
          this.localStream = mediaStream
          this.$refs.video_self.srcObject = this.localStream
          console.log('本地播放器设置成功')
        }).catch(() => {
          console.log('失败')
        })
    },
    stopV() {
      this.localStream.getTracks().forEach(function(track) {
        track.stop()
      })
    },
    addV() {

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
