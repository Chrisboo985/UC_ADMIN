import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { DaoRecordView } from 'src/sections/lgns/DAORecord/view';

// ----------------------------------------------------------------------

const metadata = { title: `DAO记录列表 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <DaoRecordView />
    </>
  );
}
