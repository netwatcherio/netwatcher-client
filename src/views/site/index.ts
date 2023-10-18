
import SiteView from "@/views/site/Index.vue";
// @ts-ignore
import Site from "@/views/site/Site.vue";
import Sites from "@/views/site/Sites.vue";
import SiteNew from "@/views/site/NewSite.vue";
import Invite from "@/views/site/Invite.vue";

export default {
  path: '/sites',
  name: 'siteView',
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
      name: 'siteNew',
      component: SiteNew,
    },
    {
      path: '/sites/:siteId/invite',
      name: 'siteInvite',
      component: Invite,
    }
  ]
}
