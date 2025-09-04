import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { GameRankingView } from 'src/sections/gameAdmin/gameHistoryAirport/view/gameRanking';

// ----------------------------------------------------------------------

const metadata = { title: `游戏排名 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <GameRankingView />
    </>
  );
}
