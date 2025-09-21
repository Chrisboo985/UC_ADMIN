import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { MenuCommunityAchievementListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `社区业绩列表  - ${CONFIG.appName}` };

export default function Page(props: { h?: boolean }) {
  const { h } = props;
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <MenuCommunityAchievementListView h={!!h} />
    </>
  );
}
