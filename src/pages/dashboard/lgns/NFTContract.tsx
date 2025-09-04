import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NFTContractView } from 'src/sections/lgns/NFTContract/view/list';

// ----------------------------------------------------------------------

const metadata = { title: `NFT合约管理 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <NFTContractView />
    </>
  );
}
