/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const dictionaryRouter = {
  path: '/dictionary',
  component: Layout,
  redirect: '/dictionary/dictionaryList',
  name: 'Dictionary',
  meta: {
    title: '字典管理',
    icon: 'table',
    roles: ['admin']
  },
  children: [
    {
      path: 'dictionaryList',
      component: () => import('@/views/dictionary/dictionaryList'),
      name: 'DictionaryList',
      meta: { title: '字典管理', roles: ['admin'] }
    },
    {
      path: 'dictionaryType',
      component: () => import('@/views/dictionary/dictionaryType'),
      name: 'DictionaryType',
      meta: { title: '字典类别', roles: ['admin'] }
    }
  ]
}
export default dictionaryRouter
