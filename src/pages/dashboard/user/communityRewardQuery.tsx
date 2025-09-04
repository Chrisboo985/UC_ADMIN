import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunityRewardQueryPage } from 'src/sections/user/communityRewardQuery';

// ----------------------------------------------------------------------

const metadata = { title: `社区奖励查询 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunityRewardQueryPage  />
    </>
  );
}
