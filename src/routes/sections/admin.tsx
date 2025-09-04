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
const OrganizationalChart = lazy(
  () => import('src/pages/dashboard/user/organizational-chart-view')
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
const RebaseRecordView = lazy(() => import('src/pages/dashboard/lgns/RebaseRecordView-list'));
const DaoRecordView = lazy(() => import('src/pages/dashboard/lgns/DAORecordView-list'));
const StakingRankingView = lazy(() => import('src/pages/dashboard/lgns/StakingRankingView-list'));
const ContractManagementView = lazy(() => import('src/pages/dashboard/lgns/bondCard/index'));
const PledgeManagementView = lazy(() => import('src/pages/dashboard/lgns/pledgeManagement/index'));
const PledgeRecordsView = lazy(
  () => import('src/pages/dashboard/financialConsole/pledgeRecordsView-list')
);
const BondPurchaseRecordsView = lazy(
  () => import('src/pages/dashboard/financialConsole/bondPurchaseRecordsView-list')
);
const RebaseOperationQueueView = lazy(
  () => import('src/pages/dashboard/lgns/rebaseOperationQueueView-list')
);
// ----------------------------------------------------------------------

const layoutContent = (
  <DashboardLayout>
    <Suspense fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  </DashboardLayout>
);

export const adminRoutes = [
  {
    path: 'admin',
    element: CONFIG.auth.skip ? <>{layoutContent}</> : <AuthGuard>{layoutContent}</AuthGuard>,
    children: [
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
          { title: 'DAO记录', path: 'daoRecord', element: <DaoRecordView /> },
          {
            title: 'Rebase操作队列',
            path: 'rebaseOperationQueue',
            element: <RebaseOperationQueueView />,
          },
          { title: '质押排名', path: 'stakingRanking', element: <StakingRankingView /> },
        ],
      },
    ],
  },
];
