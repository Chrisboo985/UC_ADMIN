import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { OrganizationalChartView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `网体查询  - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <OrganizationalChartView />
    </>
  );
}
