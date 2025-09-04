import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { BondBuyView } from 'src/sections/communityGovernance/bondBuy';

// ----------------------------------------------------------------------

const metadata = { title: `公会债券购买 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <BondBuyView />
    </>
  );
}
