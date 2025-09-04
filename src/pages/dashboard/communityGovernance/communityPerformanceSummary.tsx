import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunityPerformanceSummaryView } from 'src/sections/communityGovernance/communityPerformanceSummary';

// ----------------------------------------------------------------------

const metadata = { title: `社区绩效汇总 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunityPerformanceSummaryView />
    </>
  );
}
