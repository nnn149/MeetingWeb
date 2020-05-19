<template>
  <div class="Chat-container">
    <el-input v-model="recText" :rows="25" type="textarea" readonly placeholder="还没有人聊天..." />
    <el-input v-model="sendText" placeholder="请输入内容" maxlength="64" class="input-with-select">
      <el-button slot="prepend" size="mini" icon="el-icon-message-solid" @click="$emit('noticeEvent',sendText)" />
      <el-button slot="append" size="mini" icon="el-icon-s-promotion" @click="$emit('chatEvent',sendText)" />
    </el-input>
  </div>
</template>

<script>

export default {
  name: 'Chat',
  props: {
    client: {
      type: Object,
      default: null
    },
    receiveMsg: {
      type: String,
      require: false,
      default: ''
    }
  },
  data() {
    return {
      recText: '',
      sendText: ''
    }
  },
  watch: {
    receiveMsg() {
      this.receiveMsgHandle()
    }
  },
  methods: {
    receiveMsgHandle() {
      this.recText += this.receiveMsg
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
