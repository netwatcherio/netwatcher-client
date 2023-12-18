
import SiteView from "@/views/site/Index.vue";
// @ts-ignore
import Site from "@/views/site/SiteDashboard.vue";
import Sites from "@/views/site/Sites.vue";
import SiteNew from "@/views/site/NewSite.vue";
import Invite from "@/views/site/InviteMember.vue";
import AgentGroups from "@/views/site/AgentGroups.vue";
import AgentGroupsNew from "@/views/site/NewAgentGroup.vue";
import EditSite from "@/views/site/EditSite.vue";
import Members from "@/views/site/Members.vue";
import RemoveMember from "@/views/site/RemoveMember.vue";
import EditMember from "@/views/site/EditMember.vue";

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
      path: '/sites/:siteId/edit',
      name: 'editSite',
      component: EditSite,
    },
    {
      path: '/site/:siteId/invite',
      name: 'siteInvite',
      component: Invite,
    },
    {
      path: '/site/:siteId/members/remove/:userId',
      name: 'memberRemove',
      component: RemoveMember,
    },
    {
      path: '/site/:siteId/members/edit/:userId',
      name: 'memberEdit',
      component: EditMember,
    },
    {
      path: '/sites/:siteId/groups',
      name: 'agentGroups',
      component: AgentGroups,
    },
    {
      path: '/sites/:siteId/groups/new',
      name: 'agentGroupsNew',
      component: AgentGroupsNew,
    },
    {
      path: '/sites/:siteId/members',
      name: 'members',
      component: Members,
    }
  ]
}
