import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { CommunityRewardQueryPage } from 'src/sections/user/communityRewardQuery';

// ----------------------------------------------------------------------

const metadata = { title: `社区津贴列表 - ${CONFIG.appName}` };

export default function Page(props: { h?: boolean }) {
  const { h } = props;
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <CommunityRewardQueryPage h={!!h} />
    </>
  );
}

