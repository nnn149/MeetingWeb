import request from '@/utils/request'

export function fetchList(data) {
  return request({
    url: '/user/list',
    method: 'post',
    data
  })
}

export function fetchOne(id) {
  return request({
    url: '/user/detail',
    method: 'get',
    params: { id }
  })
}

export function createOne(data) {
  return request({
    url: '/user/add',
    method: 'post',
    data
  })
}

export function updateOne(data) {
  return request({
    url: '/user/update',
    method: 'post',
    data
  })
}

export function deleteOne(id) {
  return request({
    url: '/user/delete',
    method: 'get',
    params: { id }
  })
}

export function deleteList(data) {
  return request({
    url: '/user/deleteList',
    method: 'post',
    data
  })
}

export function importExcel(data) {
  return request({
    url: '/user/importExcel',
    method: 'post',
    data
  })
}

