import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/authentication/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/authentication/logout',
    method: 'post'
  })
}

export function register(data) {
  return request({
    url: '/authentication/register',
    method: 'post',
    data
  })
}
