import {createRouter, createWebHistory} from 'vue-router'
// @ts-ignore
import HomeView from '@/views/HomeView.vue'
// @ts-ignore
import RootView from "@/views/Root.vue";
import auth from "@/views/auth";
import profile from "@/views/profile";
import site from "@/views/site";
import agent from "@/views/agent";
import check from "@/views/check";

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
                agent,
                site,
                check,
                {
                    path: '/home',
                    name: 'home',
                    component: HomeView,
                },
            ]
        },


    ]
})


/*
SiteMap:

/home
/sites
/sites/new
/sites/:siteId
/sites/:siteId/agents/new
/sites/:siteId/agents/:agentId
/sites/:siteId/agents/:agentId/checks/
/sites/:siteId/agents/:agentId/checks/:checkId
/sites/:siteId/agents/:agentId/checks/new


*/

export default router
