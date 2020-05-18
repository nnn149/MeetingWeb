<template>
  <div class="Preview-container">
    <div style="background: black">
      <div class="video-container">
        <video autoplay :srcObject.prop="client.localStream" style="height: 100%;width: 100%" />
      </div>
    </div>
    <div class="console-container">
      <span style="max-width: 130px">
        <i class="el-icon-s-custom" />
        <span>{{ client.nickname }}</span>
      </span>
      <span>
        <i class="el-icon-chat-dot-round" @click="$emit('pmEvent',client.userId)" />
        <svg-icon icon-class="eye" @click="$emit('viewEvent',client.userId)" />
        <i class="el-icon-turn-off-microphone" @click="$emit('microEvent',client.userId)" />
        <i class="el-icon-full-screen" @click="$emit('fullEvent',client.userId)" />
        <i style="color: #ff4250;horiz-align: right" class="el-icon-error" @click="$emit('kickEvent',client.userId)" />
      </span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Preview',
  props: {
    client: {
      type: Object,
      default: null
    }
  }
}
</script>

<style lang="scss" scoped>
.Preview-container{
  display:inline-block;
  width: 260px;
  height: 200px;
  margin-right: 3px;
}
  .video-container{
    height: 170px;
    background: #939394;
    /*-webkit-mask-image: url("~@/assets/svg/people.svg");*/
    /*mask-image: url("~@/assets/svg/people.svg");*/
    /*mask-repeat: no-repeat;*/
    /*mask-position: center;*/
  }
  .console-container{
    height: 26px;
    background: white;
    line-height:30px;
  }
.console-container i {
  font-size: 22px;
}
.console-container .svg-icon {
  font-size: 22px;
}

</style>
