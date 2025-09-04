import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { StakingRankingView } from 'src/sections/lgns/stakingRanking/view';

// ----------------------------------------------------------------------

const metadata = { title: `质押排名 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <StakingRankingView />
    </>
  );
}
