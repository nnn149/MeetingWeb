<template>
  <div class="meeting-container">
    <video ref="video_self" autoplay playsinline />
    <el-button @click="startV()">开始</el-button>
    <el-button @click="stopV()">停止</el-button>
  </div>
</template>

<script>

export default {
  name: 'Meeting',
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
    }
  }

}
</script>

<style lang="scss">
</style>
