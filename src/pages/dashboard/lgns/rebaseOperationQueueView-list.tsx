import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RebaseOperationQueueView } from 'src/sections/lgns/rebaseOperationQueue/view';

// ----------------------------------------------------------------------

const metadata = { title: `Rebase操作队列 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RebaseOperationQueueView />
    </>
  );
}
