import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunityStakingView } from 'src/sections/communityGovernance/communityStaking';

// ----------------------------------------------------------------------

const metadata = { title: `社区质押 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunityStakingView />
    </>
  );
}
