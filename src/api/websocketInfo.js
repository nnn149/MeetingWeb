import request from '@/utils/request'

export function getUrl() {
  return request({
    url: '/websocket/url',
    method: 'get'
  })
}
