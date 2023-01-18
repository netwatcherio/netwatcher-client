import {createRouter, createWebHistory} from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Site from '@/views/site/Site.vue'
import Sites from '@/views/site/Sites.vue'
import SiteView from '@/views/site/Index.vue'
import SiteNew from '@/views/site/NewSite.vue'
import RootView from "@/views/Root.vue";
import auth from "@/views/auth";
import profile from "@/views/profile";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        auth,
        {
            path: '/',
            redirect: '/home',
            name: 'root',
            component: RootView,
            children: [
              profile,
                {
                    path: '/home',
                    name: 'home',
                    component: HomeView,
                },
                {
                    path: '/sites',
                    name: 'siteview',
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
        },


    ]
})

export default router
