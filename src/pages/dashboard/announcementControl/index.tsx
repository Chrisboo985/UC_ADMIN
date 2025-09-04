import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { AnnouncementControlView } from 'src/sections/announcementControl/view';

// ----------------------------------------------------------------------

const metadata = { title: `Tcash 公告控制 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <AnnouncementControlView />
    </>
  );
}
