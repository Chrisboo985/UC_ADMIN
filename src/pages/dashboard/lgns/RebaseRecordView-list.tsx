import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RebaseRecordView } from 'src/sections/lgns/rebaseRecord/view';

// ----------------------------------------------------------------------

const metadata = { title: `Rebase日志列表 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RebaseRecordView />
    </>
  );
}
