import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/config-global';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />
);

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};

// ----------------------------------------------------------------------

export const navData = [
  /**
   * Overview
   */
  {
    subheader: '数据',
    items: [
      {
        title: '数据概览统计',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
      },
      // {
      //   title: 'TGAME概览',
      //   path: paths.dashboard.tGame,
      //   icon: ICONS.kanban,
      // },
      // { title: '概览', path: paths.dashboard.root, icon: ICONS.dashboard },
      // { title: 'Ecommerce', path: paths.dashboard.general.ecommerce, icon: ICONS.ecommerce },
      // { title: 'Analytics', path: paths.dashboard.general.analytics, icon: ICONS.analytics },
      // { title: 'Banking', path: paths.dashboard.general.banking, icon: ICONS.banking },
      // { title: 'Booking', path: paths.dashboard.general.booking, icon: ICONS.booking },
      // { title: 'File', path: paths.dashboard.general.file, icon: ICONS.file },
      // { title: 'Course', path: paths.dashboard.general.course, icon: ICONS.course },
    ],
  },
  /**
   * Management
   */
  {
    subheader: '管理',
    items: [
      {
        title: '会员',
        path: paths.dashboard.user.root,
        icon: ICONS.user,
        children: [
          // { title: 'Profile', path: paths.dashboard.user.root },
          // { title: 'Cards', path: paths.dashboard.user.cards },
          { title: '会员列表', path: paths.dashboard.user.list },
          //  { title: '会员列表', path: paths.dashboard.user.list },
          // { title: '社区奖励查询', path: paths.dashboard.user.communityRewardQuery },
          // { title: '社区奖励列表', path: paths.dashboard.user.communityRewardList },
          // { title: '团队业绩查询', path: paths.dashboard.user.teamPerformanceInquiry },
          // { title: '网体查询', path: paths.dashboard.user.organizationalChart },
          // { title: '查询上级', path: paths.dashboard.user.parentList },
          // { title: '查询修改推荐人记录', path: paths.dashboard.user.parentModifyLog },
          // { title: '转账记录查询', path: paths.dashboard.user.transferLog },
          // { title: '社区业绩', path: paths.dashboard.user.performanceList },
          // { title: '社区出入金汇总', path: paths.dashboard.user.performanceBondWithSwap },
          // { title: '社区链上出入金', path: paths.dashboard.user.performanceSwap },
          // { title: '社区债券购买记录', path: paths.dashboard.user.performanceBondPurchase },
          // { title: '社区债券购买汇总', path: paths.dashboard.user.performanceBondPurchaseGather },
          // { title: 'Create', path: paths.dashboard.user.new },
          // { title: 'Edit', path: paths.dashboard.user.demo.edit },
          // { title: 'Account', path: paths.dashboard.user.account },
        ],
      },
      // {
      //   title: '合约操作台',
      //   path: paths.dashboard.lgns.root,
      //   icon: ICONS.product,
      //   children: [
      //     // { title: '概览', path: paths.dashboard.lgns.overviewAnalyticsView },
      //     // { title: '债券合约管理', path: paths.dashboard.lgns.contractManagement },
      //     { title: '配置管理', path: paths.dashboard.lgns.configManagement },
      //     // { title: '质押合约管理', path: paths.dashboard.lgns.pledgeManagement },
      //     // { title: 'Rebase日志列表', path: paths.dashboard.lgns.rebaseRecord },
      //     // { title: 'NFT合约管理', path: paths.dashboard.lgns.nftContractManagement },
      //     // { title: 'NFT空投记录', path: paths.dashboard.lgns.nftAirdropFlow },
      //     // { title: 'DAO日志列表', path: paths.dashboard.lgns.daoRecord },
      //     { title: '合约任务列表', path: paths.dashboard.lgns.contractTask },
      //     // { title: '社区分红', path: paths.dashboard.lgns.communitDividends },
      //     // { title: '层级分红', path: paths.dashboard.lgns.tierDividend },
      //     // { title: 'Rebase操作队列', path: paths.dashboard.lgns.rebaseOperationQueue },
      //     // { title: '质押排名', path: paths.dashboard.lgns.stakingRanking },
      //   ],
      // },
      {
        title: '财务控制台',
        path: paths.dashboard.financialConsole.root,
        icon: ICONS.order,
        children: [
          // { title: '质押记录', path: paths.dashboard.financialConsole.pledgeRecords },
          // { title: '债券购买记录', path: paths.dashboard.financialConsole.bondPurchaseRecords },
          // { title: '债券销售记录', path: paths.dashboard.financialConsole.bondSalesRecords },
          // { title: '债券分红流水', path: paths.dashboard.financialConsole.bondBonusIndex },
          { title: '认购节点记录', path: paths.dashboard.financialConsole.nodeOrderList },
        ],
      },
      {
        title: '日志',
        path: paths.dashboard.nodeSubscription.root,
        icon: ICONS.order,
        children: [
          { title: '节点认购', path: paths.dashboard.nodeSubscription.nodeSubscription },
        ],
      },
      // {
      //   title: '游戏管理-飞机',
      //   path: paths.dashboard.gameAirPortRush.root,
      //   icon: ICONS.chat,
      //   children: [
      //     { title: '游戏记录', path: paths.dashboard.gameAirPortRush.gameHistory },
      //     { title: '游戏排名', path: paths.dashboard.gameAirPortRush.gameRanking },
      //   ],
      // },
      // {
      //   title: '社区治理',
      //   path: paths.dashboard.communityGovernance.root,
      //   icon: ICONS.booking,
      //   children: [
      //     { title: '公会出入金', path: paths.dashboard.communityGovernance.unionData },
      //     { title: '社区业绩汇总', path: paths.dashboard.communityGovernance.communityPerformanceSummary },
      //     { title: '公会债券购买', path: paths.dashboard.communityGovernance.bondBuy },
      //     { title: '社区质押', path: paths.dashboard.communityGovernance.communityStaking },

      //     { title: '公告控制', path: paths.dashboard.communityGovernance.announcementControl },
      //     // { title: '社区债券购买记录', path: paths.dashboard.communityGovernance.communityBondPurchaseDailyRecordList },
      //   ],
      // },

      // {
      //   title: 'Product',
      //   path: paths.dashboard.product.root,
      //   icon: ICONS.product,
      //   children: [
      //     { title: 'List', path: paths.dashboard.product.root },
      //     { title: 'Details', path: paths.dashboard.product.demo.details },
      //     { title: 'Create', path: paths.dashboard.product.new },
      //     { title: 'Edit', path: paths.dashboard.product.demo.edit },
      //   ],
      // },
      // {
      //   title: 'Order',
      //   path: paths.dashboard.order.root,
      //   icon: ICONS.order,
      //   children: [
      //     { title: 'List', path: paths.dashboard.order.root },
      //     { title: 'Details', path: paths.dashboard.order.demo.details },
      //   ],
      // },
      // {
      //   title: 'Invoice',
      //   path: paths.dashboard.invoice.root,
      //   icon: ICONS.invoice,
      //   children: [
      //     { title: 'List', path: paths.dashboard.invoice.root },
      //     { title: 'Details', path: paths.dashboard.invoice.demo.details },
      //     { title: 'Create', path: paths.dashboard.invoice.new },
      //     { title: 'Edit', path: paths.dashboard.invoice.demo.edit },
      //   ],
      // },
      // {
      //   title: 'Blog',
      //   path: paths.dashboard.post.root,
      //   icon: ICONS.blog,
      //   children: [
      //     { title: 'List', path: paths.dashboard.post.root },
      //     { title: 'Details', path: paths.dashboard.post.demo.details },
      //     { title: 'Create', path: paths.dashboard.post.new },
      //     { title: 'Edit', path: paths.dashboard.post.demo.edit },
      //   ],
      // },
      // {
      //   title: 'Job',
      //   path: paths.dashboard.job.root,
      //   icon: ICONS.job,
      //   children: [
      //     { title: 'List', path: paths.dashboard.job.root },
      //     { title: 'Details', path: paths.dashboard.job.demo.details },
      //     { title: 'Create', path: paths.dashboard.job.new },
      //     { title: 'Edit', path: paths.dashboard.job.demo.edit },
      //   ],
      // },
      // {
      //   title: 'Tour',
      //   path: paths.dashboard.tour.root,
      //   icon: ICONS.tour,
      //   children: [
      //     { title: 'List', path: paths.dashboard.tour.root },
      //     { title: 'Details', path: paths.dashboard.tour.demo.details },
      //     { title: 'Create', path: paths.dashboard.tour.new },
      //     { title: 'Edit', path: paths.dashboard.tour.demo.edit },
      //   ],
      // },
      // { title: 'File manager', path: paths.dashboard.fileManager, icon: ICONS.folder },
      // {
      //   title: 'Mail',
      //   path: paths.dashboard.mail,
      //   icon: ICONS.mail,
      //   info: (
      //     <Label color="error" variant="inverted">
      //       +32
      //     </Label>
      //   ),
      // },
      // { title: 'Chat', path: paths.dashboard.chat, icon: ICONS.chat },
      // { title: 'Calendar', path: paths.dashboard.calendar, icon: ICONS.calendar },
      // { title: 'Kanban', path: paths.dashboard.kanban, icon: ICONS.kanban },
    ],
  },
  /**
   * Item State
   */
  // {
  //   subheader: 'Misc',
  //   items: [
  //     {
  //       // default roles : All roles can see this entry.
  //       // roles: ['user'] Only users can see this item.
  //       // roles: ['admin'] Only admin can see this item.
  //       // roles: ['admin', 'manager'] Only admin/manager can see this item.
  //       // Reference from 'src/guards/RoleBasedGuard'.
  //       title: 'Permission',
  //       path: paths.dashboard.permission,
  //       icon: ICONS.lock,
  //       roles: ['admin', 'manager'],
  //       caption: 'Only admin can see this item',
  //     },
  //     {
  //       title: 'Level',
  //       path: '#/dashboard/menu_level',
  //       icon: ICONS.menuItem,
  //       children: [
  //         {
  //           title: 'Level 1a',
  //           path: '#/dashboard/menu_level/menu_level_1a',
  //           children: [
  //             {
  //               title: 'Level 2a',
  //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2a',
  //             },
  //             {
  //               title: 'Level 2b',
  //               path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b',
  //               children: [
  //                 {
  //                   title: 'Level 3a',
  //                   path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3a',
  //                 },
  //                 {
  //                   title: 'Level 3b',
  //                   path: '#/dashboard/menu_level/menu_level_1a/menu_level_2b/menu_level_3b',
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //         { title: 'Level 1b', path: '#/dashboard/menu_level/menu_level_1b' },
  //       ],
  //     },
  //     {
  //       title: 'Disabled',
  //       path: '#disabled',
  //       icon: ICONS.disabled,
  //       disabled: true,
  //     },
  //     {
  //       title: 'Label',
  //       path: '#label',
  //       icon: ICONS.label,
  //       info: (
  //         <Label
  //           color="info"
  //           variant="inverted"
  //           startIcon={<Iconify icon="solar:bell-bing-bold-duotone" />}
  //         >
  //           NEW
  //         </Label>
  //       ),
  //     },
  //     {
  //       title: 'Caption',
  //       path: '#caption',
  //       icon: ICONS.menuItem,
  //       caption:
  //         'Quisque malesuada placerat nisl. In hac habitasse platea dictumst. Cras id dui. Pellentesque commodo eros a enim. Morbi mollis tellus ac sapien.',
  //     },
  //     {
  //       title: 'Params',
  //       path: '/dashboard/params?id=e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1',
  //       icon: ICONS.parameter,
  //     },
  //     {
  //       title: 'External link',
  //       path: 'https://www.google.com/',
  //       icon: ICONS.external,
  //       info: <Iconify width={18} icon="prime:external-link" />,
  //     },
  //     { title: 'Blank', path: paths.dashboard.blank, icon: ICONS.blank },
  //   ],
  // },
];
