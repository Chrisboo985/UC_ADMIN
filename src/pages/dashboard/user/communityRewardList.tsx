import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunityRewardLogView } from 'src/sections/user/communityRewardLog/user-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `社区奖励列表 | 控制台 - ${CONFIG.appName}` };

export default function Page(props: { h?: boolean }) {
  const { h } = props;
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunityRewardLogView h={!!h} />
    </>
  );
}
