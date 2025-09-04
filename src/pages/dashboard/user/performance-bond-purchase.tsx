import { CONFIG } from 'src/config-global';
import { Helmet } from 'react-helmet-async';

// 直接导入组件，而不是通过模块导入
import UserListView from 'src/sections/user/performance-bond-purchase/user-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `社区债券购买记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserListView />
    </>
  );
}
