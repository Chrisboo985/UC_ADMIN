import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunityBondPurchaseDailyRecordListView } from 'src/sections/communityBondPurchaseDailyRecordList/view';

// ----------------------------------------------------------------------

const metadata = { title: `社区债券购买记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunityBondPurchaseDailyRecordListView />
    </>
  );
}
