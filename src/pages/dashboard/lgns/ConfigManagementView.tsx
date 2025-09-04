import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { ConfigManagementView } from 'src/sections/lgns/configManagement/view';

// ----------------------------------------------------------------------

const metadata = { title: `配置管理 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <ConfigManagementView />
    </>
  );
}
