import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Site from '@/views/site/Site.vue'
import Sites from '@/views/site/Sites.vue'
import SiteView from '@/views/site/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:siteId',
      name: 'home',
      component: HomeView
    },
    {
      path: '/sites',
      name: 'site',
      component: SiteView,
      children: [
        {
          path: '/sites/:siteId',
          name: 'site',
          component: Site,
        },
        {
          path: '/sites',
          name: 'sites',
          component: Sites,
        }
      ]
    },
  ]
})

export default router
