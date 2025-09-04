import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NFTAirdropFlowView } from 'src/sections/lgns/NFTAirdropFlow/view/list';

// ----------------------------------------------------------------------

const metadata = { title: `NFT空投记录 | 控制台 - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <NFTAirdropFlowView />
    </>
  );
}
