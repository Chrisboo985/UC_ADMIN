import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunitDividendsView } from 'src/sections/lgns/communitDividends/view';

// ----------------------------------------------------------------------

const metadata = { title: `社区分红 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunitDividendsView />
    </>
  );
}
