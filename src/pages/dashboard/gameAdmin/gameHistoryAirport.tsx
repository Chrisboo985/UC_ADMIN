import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { GameHistoryAirportView } from 'src/sections/gameAdmin/gameHistoryAirport/view/list';

// ----------------------------------------------------------------------

const metadata = { title: `游戏记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <GameHistoryAirportView />
    </>
  );
}
