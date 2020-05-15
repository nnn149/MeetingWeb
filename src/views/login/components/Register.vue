<template>
  <div class="register-container">
    <el-form ref="ruleForm" :model="ruleForm" status-icon :rules="rules" label-width="100px" class="demo-ruleForm">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="ruleForm.username" maxlength="16" autocomplete="off" />
      </el-form-item>
      <el-form-item label="密码" prop="pass">
        <el-input v-model="ruleForm.pass" type="password" maxlength="16" autocomplete="off" />
      </el-form-item>
      <el-form-item label="确认密码" prop="checkPass">
        <el-input v-model="ruleForm.checkPass" type="password" maxlength="16" autocomplete="off" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickname">
        <el-input v-model="ruleForm.nickname" maxlength="16" autocomplete="off" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="ruleForm.email" maxlength="64" autocomplete="off" />
      </el-form-item>
      <div class="reg-btn">
        <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
        <el-button @click="resetForm('ruleForm')">重置</el-button>
      </div>

    </el-form>
  </div>
</template>

<script>
// import openWindow from '@/utils/open-window'
import { register } from '@/api/user'
export default {
  name: 'Register',
  data() {
    var checkUsername = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入用户名'))
      }
      var reg = /^[a-zA-Z]\w{4,15}$/
      if (!reg.test(value)) {
        return callback(new Error('字母开头，5-16字节，字母数字下划线组合'))
      }
      callback()
    }
    var checkEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入邮箱'))
      }
      var reg = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
      if (!reg.test(value)) {
        return callback(new Error('邮箱格式错误'))
      }
      callback()
    }
    var checkNickname = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入昵称'))
      }
      var reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/
      if (!reg.test(value)) {
        return callback(new Error('中文、英文、数字及下划线'))
      }
      callback()
    }
    var validatePass = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入密码'))
      } else {
        var reg = /^[\u0021-\u007E]{6,16}$/
        if (!reg.test(value)) {
          return callback(new Error('长度6-16'))
        }
        if (this.ruleForm.checkPass !== '') {
          this.$refs.ruleForm.validateField('checkPass')
        }
        callback()
      }
    }
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.ruleForm.pass) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      ruleForm: {
        username: '',
        pass: '',
        checkPass: '',
        nickname: '',
        email: ''
      },
      rules: {
        pass: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPass: [
          { validator: validatePass2, trigger: ['change', 'blur'] }
        ],
        username: [
          { validator: checkUsername, trigger: 'blur' }
        ],
        nickname: [
          { validator: checkNickname, trigger: 'blur' }
        ],
        email: [
          { validator: checkEmail, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          register(this.ruleForm).then(() => {
            this.$notify({
              title: '成功',
              message: '注册成功，现在可以登录',
              type: 'success',
              duration: 2000
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
  .reg-btn{
    text-align: center;
  }
.demo-ruleForm input{
  color: #606266;
}
</style>
