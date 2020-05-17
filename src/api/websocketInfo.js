import request from '@/utils/request'

export function getUrl() {
  return request({
    url: '/WebrtcWs/url',
    method: 'get'
  })
}
