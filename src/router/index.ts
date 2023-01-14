import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Site from '@/views/site/Site.vue'
import Sites from '@/views/site/Sites.vue'
import SiteView from '@/views/site/Index.vue'
import SiteNew from '@/views/site/NewSite.vue'
import Login from '@/views/Login.vue'
import Register from "@/views/Register.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
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
        },
        {
          path: '/sites/new',
          name: 'newSite',
          component: SiteNew,
        }
      ]
    },
  ]
})

export default router
