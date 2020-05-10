<template>
  <el-select v-model="sValue" multiple filterable placeholder="请选择">
    <el-option
      v-for="item in selectOptions"
      :key="item.id"
      :label="item.title"
      :value="item.id"
    />
  </el-select>
</template>
<script>
import { baseList } from '@/api/dictionary'
import { baseTypeList } from '@/api/dictionaryType'
export default {
  name: 'MultipleSelect',
  props: {
    value: {
      type: String,
      required: true
    },
    typeId: {
      type: String,
      required: false,
      default: '0'
    },
    switch: {
      type: String,
      required: false,
      default: 'default'
    }
  },
  data() {
    return {
      sValue: [],
      selectOptions: []
    }
  },
  watch: {
    sValue: function(val, oldVal) {
      if (val !== oldVal) {
        this.$emit('input', val)
      }
    },
    value: function(val, oldVal) {
      this.sValue = val
    }
  },
  mounted() {
    // 初始化下拉框的值
    this.sValue = this.value
    this.refreshSelect(this.typeId)
  },
  methods: {
    refreshSelect(typeId) {
      const params = {
        type: typeId
      }
      if (this.switch === 'type') {
        baseTypeList().then(response => {
          this.selectOptions = response.data
        })
      } else {
        baseList(params).then(response => {
          this.selectOptions = response.data
        })
      }
    }
  }
}
</script>
