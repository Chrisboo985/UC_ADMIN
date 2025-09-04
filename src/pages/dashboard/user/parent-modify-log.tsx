import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ParentModifyLogView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `查询修改推荐人记录 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ParentModifyLogView />
    </>
  );
}