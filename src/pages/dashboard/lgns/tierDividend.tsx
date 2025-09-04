import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TierDividendView } from 'src/sections/lgns/tierDividend/view';

// ----------------------------------------------------------------------

const metadata = { title: `层级分红 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TierDividendView />
    </>
  );
}
