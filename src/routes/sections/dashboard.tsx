import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import { CONFIG } from 'src/config-global';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

// Overview
const IndexPage = lazy(() => import('src/pages/dashboard'));
const OverviewEcommercePage = lazy(() => import('src/pages/dashboard/ecommerce'));
const OverviewAnalyticsPage = lazy(() => import('src/pages/dashboard/analytics'));
const OverviewBankingPage = lazy(() => import('src/pages/dashboard/banking'));
const OverviewBookingPage = lazy(() => import('src/pages/dashboard/booking'));
const OverviewFilePage = lazy(() => import('src/pages/dashboard/file'));
const OverviewCoursePage = lazy(() => import('src/pages/dashboard/course'));
// Product
const ProductDetailsPage = lazy(() => import('src/pages/dashboard/product/details'));
const ProductListPage = lazy(() => import('src/pages/dashboard/product/list'));
const ProductCreatePage = lazy(() => import('src/pages/dashboard/product/new'));
const ProductEditPage = lazy(() => import('src/pages/dashboard/product/edit'));
// Order
const OrderListPage = lazy(() => import('src/pages/dashboard/order/list'));
const OrderDetailsPage = lazy(() => import('src/pages/dashboard/order/details'));
// Invoice
const InvoiceListPage = lazy(() => import('src/pages/dashboard/invoice/list'));
const InvoiceDetailsPage = lazy(() => import('src/pages/dashboard/invoice/details'));
const InvoiceCreatePage = lazy(() => import('src/pages/dashboard/invoice/new'));
const InvoiceEditPage = lazy(() => import('src/pages/dashboard/invoice/edit'));
// User
const UserProfilePage = lazy(() => import('src/pages/dashboard/user/profile'));
const UserCardsPage = lazy(() => import('src/pages/dashboard/user/cards'));
const UserListPage = lazy(() => import('src/pages/dashboard/user/list'));
const MenuCommunityAchievementListPage = lazy(() => import('src/pages/dashboard/user/menu-community-achievement-list'))
const UserList2Page = lazy(() => import('src/pages/dashboard/user/list'));
const CommunityRewardQueryPage = lazy(
  () => import('src/pages/dashboard/user/communityRewardQuery')
);
const CommunityRewardListPage = lazy(
  () => import('src/pages/dashboard/user/communityRewardList')
);
const OrganizationalChart = lazy(
  () => import('src/pages/dashboard/user/organizational-chart-view')
);
const ParentListPage = lazy(
  () => import('src/pages/dashboard/user/parent-list')
);
const ParentModifyLogPage = lazy(
  () => import('src/pages/dashboard/user/parent-modify-log')
);
const TransferLogPage = lazy(
  () => import('src/pages/dashboard/user/transfer-log')
);
const PerformanceList = lazy(
  () => import('src/pages/dashboard/user/performance-list')
);
const PerformanceSwap = lazy(
  () => import('src/pages/dashboard/user/performance-swap')
);
const PerformanceBondPurchase = lazy(
  () => import('src/pages/dashboard/user/performance-bond-purchase')
);
const PerformanceBondPurchaseGather = lazy(
  () => import('src/pages/dashboard/user/performance-bond-purchase-gather')
);
const PerformanceBondWithSwap = lazy(
  () => import('src/pages/dashboard/user/performance-bond-with-swap')
);
const NftContractManagementView = lazy(
  () => import('src/pages/dashboard/lgns/NFTContract')
);
const GameHistoryAirportView = lazy(
  () => import('src/pages/dashboard/gameAdmin/gameHistoryAirport')
);
// 社区治理
const CommunityGovernanceView = lazy(
  () => import('src/pages/dashboard/communityGovernance/unionData')
);
const CommunityPerformanceSummaryView = lazy(
  () => import('src/pages/dashboard/communityGovernance/communityPerformanceSummary')
);
// 社区债券购买日记录列表
const CommunityBondPurchaseDailyRecordListView = lazy(
  () => import('src/pages/dashboard/communityBondPurchaseDailyRecordList')
);
// Tcash 公告控制
const AnnouncementControlView = lazy(
  () => import('src/pages/dashboard/announcementControl')
);


const TeamPerformanceInquiryPage = lazy(
  () => import('src/pages/dashboard/user/team-performance-inquiry')
);

const UserAccountPage = lazy(() => import('src/pages/dashboard/user/account'));
const UserCreatePage = lazy(() => import('src/pages/dashboard/user/new'));
const UserEditPage = lazy(() => import('src/pages/dashboard/user/edit'));
// Blog
const BlogPostsPage = lazy(() => import('src/pages/dashboard/post/list'));
const BlogPostPage = lazy(() => import('src/pages/dashboard/post/details'));
const BlogNewPostPage = lazy(() => import('src/pages/dashboard/post/new'));
const BlogEditPostPage = lazy(() => import('src/pages/dashboard/post/edit'));
// Job
const JobDetailsPage = lazy(() => import('src/pages/dashboard/job/details'));
const JobListPage = lazy(() => import('src/pages/dashboard/job/list'));
const JobCreatePage = lazy(() => import('src/pages/dashboard/job/new'));
const JobEditPage = lazy(() => import('src/pages/dashboard/job/edit'));
// Tour
const TourDetailsPage = lazy(() => import('src/pages/dashboard/tour/details'));
const TourListPage = lazy(() => import('src/pages/dashboard/tour/list'));
const TourCreatePage = lazy(() => import('src/pages/dashboard/tour/new'));
const TourEditPage = lazy(() => import('src/pages/dashboard/tour/edit'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/dashboard/file-manager'));
// App
const ChatPage = lazy(() => import('src/pages/dashboard/chat'));
const MailPage = lazy(() => import('src/pages/dashboard/mail'));
const CalendarPage = lazy(() => import('src/pages/dashboard/calendar'));
const KanbanPage = lazy(() => import('src/pages/dashboard/kanban'));
// Test render page by role
const PermissionDeniedPage = lazy(() => import('src/pages/dashboard/permission'));
// Blank page
const ParamsPage = lazy(() => import('src/pages/dashboard/params'));
const BlankPage = lazy(() => import('src/pages/dashboard/blank'));

// Lgns page
const OverviewAppView = lazy(() => import('src/pages/dashboard/lgns/overView'));
const TGAMEOverviewAppView = lazy(() => import('src/pages/dashboard/lgns/tgameOverView'));
const RebaseRecordView = lazy(() => import('src/pages/dashboard/lgns/RebaseRecordView-list'));
const ConfigManagementView = lazy(() => import('src/pages/dashboard/lgns/ConfigManagementView'));

const DaoRecordView = lazy(() => import('src/pages/dashboard/lgns/DAORecordView-list'));
const ContractTaskView = lazy(() => import('src/pages/dashboard/lgns/ContractTaskView-list'));
const StakingRankingView = lazy(() => import('src/pages/dashboard/lgns/StakingRankingView-list'));
const CommunityStakingView = lazy(() => import('src/pages/dashboard/communityGovernance/communityStaking'));
const ContractManagementView = lazy(() => import('src/pages/dashboard/lgns/bondCard/index'));
const PledgeManagementView = lazy(() => import('src/pages/dashboard/lgns/pledgeManagement/index'));
const PledgeRecordsView = lazy(
  () => import('src/pages/dashboard/financialConsole/pledgeRecordsView-list')
);
const BondPurchaseRecordsView = lazy(
  () => import('src/pages/dashboard/financialConsole/bondPurchaseRecordsView-list')
);
const BondSalesRecordsView = lazy(
  () => import('src/pages/dashboard/financialConsole/bondSalesRecordsView-list')
);
const RebaseOperationQueueView = lazy(
  () => import('src/pages/dashboard/lgns/rebaseOperationQueueView-list')
);
const TRebaseOperationQueueView = lazy(
  () => import('src/pages/dashboard/lgns/tGameRebaseOperationQueueView-list')
);
const CommunitDividendsView = lazy(
  () => import('src/pages/dashboard/lgns/communitDividends')
);
const TierDividendView = lazy(() => import('src/pages/dashboard/lgns/tierDividend'));
const BondBonusIndexView = lazy(
  () => import('src/pages/dashboard/financialConsole/bondBonusIndex')
);
const GameRankingView = lazy(() => import('src/pages/dashboard/gameAdmin/gameRanking'));
const NftAirdropFlowView = lazy(() => import('src/pages/dashboard/lgns/NFTAirdropFlow'));

/** Log */
const NodeSubscriptionLogPage = lazy(() => import('src/pages/dashboard/log/list'));
const NodeOrderListPage = lazy(() => import('src/pages/dashboard/log/order-list'));

/** recharge */
const RechargeListPage = lazy(() => import('src/pages/dashboard/recharge/list'));
// ----------------------------------------------------------------------

const BondBuyView = lazy(() => import('src/pages/dashboard/communityGovernance/bondBuy'));

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
      {
        element: <OverviewAppView />,
        index: true,
      },
      {
        path: 'tGame',
        element: <TGAMEOverviewAppView />,
      },
      // { element: <IndexPage />, index: true },
      { path: 'ecommerce', element: <OverviewEcommercePage /> },
      { path: 'analytics', element: <OverviewAnalyticsPage /> },
      { path: 'banking', element: <OverviewBankingPage /> },
      { path: 'booking', element: <OverviewBookingPage /> },
      { path: 'file', element: <OverviewFilePage /> },
      { path: 'course', element: <OverviewCoursePage /> },
      {
        path: 'user',
        children: [
          { element: <UserListPage />, index: true },
          // { path: 'profile', element: <UserProfilePage /> },
          // { path: 'cards', element: <UserCardsPage /> },
          { title: '会员列表', path: 'list', element: <UserListPage /> },
          {
            title: '社区业绩列表',
            path: 'menu-community-achievement-list',
            element: <MenuCommunityAchievementListPage />
          },
          // { title: '网体结构', path: 'organizationalChart', element: <OrganizationalChart /> },
          // { title: '查询上级', path: 'parent-list', element: <ParentListPage /> },
          // { title: '查询修改推荐人记录', path: 'parent-modify-log', element: <ParentModifyLogPage /> },
          // { title: '转账记录查询', path: 'transfer-log', element: <TransferLogPage /> },
          // { title: '社区业绩', path: 'performance-list', element: <PerformanceList /> },
          // { title: '社区链上出入金', path: 'performance-swap', element: <PerformanceSwap /> },
          // { title: '社区债券购买记录', path: 'performance-bond-purchase', element: <PerformanceBondPurchase /> },
          // { title: '社区债券购买汇总', path: 'performance-bond-purchase-gather', element: <PerformanceBondPurchaseGather /> },
          // { title: '社区出入金汇总', path: 'performance-bond-with-swap', element: <PerformanceBondWithSwap /> },
          // { title: '社区奖励查询', path: 'communityRewardQuery', element: <CommunityRewardQueryPage /> },
          // { path: 'communityRewardList', element: <CommunityRewardListPage /> },
          // { title: '团队业绩查询', path: 'teamPerformanceInquiry', element: <TeamPerformanceInquiryPage /> },
          // { path: 'new', element: <UserCreatePage /> },
          // { path: ':id/edit', element: <UserEditPage /> },
          // { path: 'account', element: <UserAccountPage /> },
        ],
      },
      {
        path: 'log',
        children: [
          { element: <NodeSubscriptionLogPage />, index: true },
          { title: '节点认购', path: 'node-subscription', element: <NodeSubscriptionLogPage /> },
        ],
      },
      {
        path: 'recharge',
        children: [
          { element: <RechargeListPage />, index: true },
          { title: '充值列表', path: 'recharge-list', element: <RechargeListPage /> },
        ],
      },
      {
        title: '合约管理',
        path: 'lgns',
        children: [
          { element: <PledgeManagementView />, index: true },
          {
            title: '质押合约管理',
            path: 'pledgeManagement',
            element: <PledgeManagementView />,
          },
          {
            title: '债券合约管理',
            path: 'contractManagement',
            element: <ContractManagementView />,
          },
          { title: 'Rebase记录', path: 'rebaseRecord', element: <RebaseRecordView /> },
          { title: '配置管理', path: 'configManagement', element: <ConfigManagementView /> },
          { title: 'DAO记录', path: 'daoRecord', element: <DaoRecordView /> },
          { title: 'NFT合约管理', path: 'nftContractManagement', element: <NftContractManagementView /> },
          { title: 'NFT空投记录', path: 'nftAirdropFlow', element: <NftAirdropFlowView /> },
          { title: '合约任务', path: 'contractTask', element: <ContractTaskView /> },
          {
            title: 'Rebase操作队列',
            path: 'rebaseOperationQueue',
            element: <RebaseOperationQueueView />,
          },
          {
            title: 'TgameRebase操作队列',
            path: 'tGameRebaseOperationQueue',
            element: <TRebaseOperationQueueView />,
          },
          { title: '质押排名', path: 'stakingRanking', element: <StakingRankingView /> },
          { path: 'communitDividends', element: <CommunitDividendsView /> },
          { path: 'tierDividend', element: <TierDividendView /> },
        ],
      },
      {
        title: '财务控制台',
        path: 'financialConsole',
        children: [
          { element: <PledgeRecordsView />, index: true },
          { path: 'pledgeRecords', element: <PledgeRecordsView /> },
          { path: 'bondPurchaseRecords', element: <BondPurchaseRecordsView /> },
          { path: 'bondSalesRecords', element: <BondSalesRecordsView /> },
          { path: 'bondBonusIndex', element: <BondBonusIndexView /> },
          { title: '节点订单列表', path: 'nodeOrderList', element: <NodeOrderListPage /> },
        ],
      },

      {
        title: '游戏管理-飞机',
        path: 'gameAirPortRush',
        children: [
          { element: <GameHistoryAirportView />, index: true },
          { path: 'gameHistory', element: <GameHistoryAirportView /> },
          { path: 'gameRanking', element: <GameRankingView /> },
        ],
      },
      {
        title: '社区治理',
        path: 'communityGovernance',
        children: [
          { element: <CommunityGovernanceView />, index: true },

          { path: 'unionData', element: <CommunityGovernanceView /> },
          { path: 'communityPerformanceSummary', element: <CommunityPerformanceSummaryView /> },
          { path: 'bondBuy', element: <BondBuyView /> },
          { path: 'communityStaking', element: <CommunityStakingView /> },

          { path: 'announcementControl', element: <AnnouncementControlView /> },
          // 社区债券购买日记录列表
          { path: 'communityBondPurchaseDailyRecordList', element: <CommunityBondPurchaseDailyRecordListView /> },
        ],
      },
      {
        path: 'product',
        children: [
          { element: <ProductListPage />, index: true },
          { path: 'list', element: <ProductListPage /> },
          { path: ':id', element: <ProductDetailsPage /> },
          { path: 'new', element: <ProductCreatePage /> },
          { path: ':id/edit', element: <ProductEditPage /> },
        ],
      },
      {
        path: 'order',
        children: [
          { element: <OrderListPage />, index: true },
          { path: 'list', element: <OrderListPage /> },
          { path: ':id', element: <OrderDetailsPage /> },
        ],
      },
      {
        path: 'invoice',
        children: [
          { element: <InvoiceListPage />, index: true },
          { path: 'list', element: <InvoiceListPage /> },
          { path: ':id', element: <InvoiceDetailsPage /> },
          { path: ':id/edit', element: <InvoiceEditPage /> },
          { path: 'new', element: <InvoiceCreatePage /> },
        ],
      },
      {
        path: 'post',
        children: [
          { element: <BlogPostsPage />, index: true },
          { path: 'list', element: <BlogPostsPage /> },
          { path: ':title', element: <BlogPostPage /> },
          { path: ':title/edit', element: <BlogEditPostPage /> },
          { path: 'new', element: <BlogNewPostPage /> },
        ],
      },
      {
        path: 'job',
        children: [
          { element: <JobListPage />, index: true },
          { path: 'list', element: <JobListPage /> },
          { path: ':id', element: <JobDetailsPage /> },
          { path: 'new', element: <JobCreatePage /> },
          { path: ':id/edit', element: <JobEditPage /> },
        ],
      },
      {
        path: 'tour',
        children: [
          { element: <TourListPage />, index: true },
          { path: 'list', element: <TourListPage /> },
          { path: ':id', element: <TourDetailsPage /> },
          { path: 'new', element: <TourCreatePage /> },
          { path: ':id/edit', element: <TourEditPage /> },
        ],
      },
      { path: 'file-manager', element: <FileManagerPage /> },
      { path: 'mail', element: <MailPage /> },
      { path: 'chat', element: <ChatPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'kanban', element: <KanbanPage /> },
      { path: 'permission', element: <PermissionDeniedPage /> },
      { path: 'params', element: <ParamsPage /> },
      { path: 'blank', element: <BlankPage /> },
    ],
  },
];
