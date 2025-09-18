import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';

import { NodeOrderListView } from 'src/sections/user/view/node-order-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `节点订单列表  - ${CONFIG.appName}` };

export default function Page(props: { h?: boolean }) {
  const { h } = props;
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <NodeOrderListView h={!!h} />
    </>
  );
}