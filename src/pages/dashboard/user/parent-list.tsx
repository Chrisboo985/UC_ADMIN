import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ParentListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

function ParentListPage() {
  return (
    <>
      <Helmet>
        <title> 查询上级 - {CONFIG.appName}</title>
      </Helmet>

      <ParentListView />
    </>
  );
}

export default ParentListPage;
