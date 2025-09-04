import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { TeamPerformanceInquiryView } from 'src/sections/user/team-performance-inquiry/view';

// ----------------------------------------------------------------------

const metadata = { title: `团队业绩查询 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <TeamPerformanceInquiryView />
    </>
  );
}
