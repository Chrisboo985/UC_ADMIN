import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BondPurchaseRecordsView } from 'src/sections/financialConsole/bondPurchaseRecords/view';

// ----------------------------------------------------------------------

const metadata = { title: `债券购买记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BondPurchaseRecordsView />
    </>
  );
}
