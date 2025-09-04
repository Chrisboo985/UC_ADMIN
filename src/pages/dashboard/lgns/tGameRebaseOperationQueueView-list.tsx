import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TGameRebaseOperationQueueView } from 'src/sections/lgns/tGameRebaseOperationQueue/view';

// ----------------------------------------------------------------------

const metadata = { title: `tGameRebase操作队列 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TGameRebaseOperationQueueView />
    </>
  );
}

