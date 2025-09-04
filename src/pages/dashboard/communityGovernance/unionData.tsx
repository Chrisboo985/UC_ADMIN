import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { UnionDataView } from 'src/sections/communityGovernance/unionData';

// ----------------------------------------------------------------------

const metadata = { title: `公会出入金 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UnionDataView />
    </>
  );
}
