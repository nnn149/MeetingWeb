import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: '/dictionary/list',
    method: 'get',
    params: query
  })
}

export function fetchOne(id) {
  return request({
    url: '/dictionary/detail',
    method: 'get',
    params: { id }
  })
}

export function createOne(data) {
  return request({
    url: '/dictionary/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: '/dictionary/update',
    method: 'post',
    data
  })
}

export function deleteOne(id) {
  return request({
    url: '/dictionary/delete',
    method: 'get',
    params: { id }
  })
}

export function deleteList(data) {
  return request({
    url: '/dictionary/deleteList',
    method: 'post',
    data
  })
}

export function baseList(query) {
  return request({
    url: '/dictionary/baseList',
    method: 'get',
    params: query
  })
}
