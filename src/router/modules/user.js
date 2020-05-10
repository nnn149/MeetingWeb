/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const userRouter = {
  path: '/user',
  component: Layout,
  redirect: '/user/userList',
  name: 'User',
  meta: {
    title: '账号管理',
    icon: 'table',
    roles: ['admin']
  },
  children: [
    {
      path: 'userList',
      component: () => import('@/views/user/userList'),
      name: 'UserList',
      meta: { title: '账号管理', roles: ['admin'] }
    }
  ]
}
export default userRouter
