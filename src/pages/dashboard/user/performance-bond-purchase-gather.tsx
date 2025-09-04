import { CONFIG } from 'src/config-global';
import { Helmet } from 'react-helmet-async';

// 导入优化后的组件
import UserListView from 'src/sections/user/performance-bond-purchase-gather/user-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `社区债券购买汇总 | 控制台 - ${CONFIG.appName}` };

export default function Page(): JSX.Element {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UserListView />
    </>
  );
}
