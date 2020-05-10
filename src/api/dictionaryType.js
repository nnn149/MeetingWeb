import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dictionaryType/list',
    method: 'get',
    params: query
  })
}

export function fetchOne(id) {
  return request({
    url: '/dictionaryType/detail',
    method: 'get',
    params: { id }
  })
}

export function createOne(data) {
  return request({
    url: '/dictionaryType/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: '/dictionaryType/update',
    method: 'post',
    data
  })
}

export function deleteOne(id) {
  return request({
    url: '/dictionaryType/delete',
    method: 'get',
    params: { id }
  })
}

export function deleteList(data) {
  return request({
    url: '/dictionaryType/deleteList',
    method: 'post',
    data
  })
}
export function baseTypeList() {
  return request({
    url: '/dictionaryType/baseList',
    method: 'get'
  })
}
