import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { RechargeListView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

const metadata = { title: `节点认购  - ${CONFIG.appName}` };

export default function Page(props: { h?: boolean }) {
  const { h } = props;
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RechargeListView h={!!h} />
    </>
  );
}
