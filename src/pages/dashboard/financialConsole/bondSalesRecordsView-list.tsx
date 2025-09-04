import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BondSalesRecordsView } from 'src/sections/financialConsole/bondSalesRecord/view';

// ----------------------------------------------------------------------

const metadata = { title: `债券销售记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BondSalesRecordsView />
    </>
  );
}