import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { PledgeRecordsView } from 'src/sections/financialConsole/pledgeRecords/view';

// ----------------------------------------------------------------------

const metadata = { title: `质押记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PledgeRecordsView />
    </>
  );
}
