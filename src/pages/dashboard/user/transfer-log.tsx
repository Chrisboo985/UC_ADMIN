import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TransferLogView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `转账记录查询 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TransferLogView />
    </>
  );
}
