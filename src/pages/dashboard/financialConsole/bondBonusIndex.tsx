import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BondBonusIndex } from 'src/sections/financialConsole/bondBonusIndex/view';

// ----------------------------------------------------------------------

const metadata = { title: `债券分红流水 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BondBonusIndex />
    </>
  );
}
