import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { RebaseOperationQueueView } from 'src/sections/lgns/rebaseOperationQueue/view/list';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { BondCard } from './components/BondCard';

import './index.css';

const bonds = [
  {
    title: '质押Rebase利率',
    contractAddress: '0x3b3301Fed1a26eB7C7bC89E8F31bA2843Cd17f2A',
  },
];

function ContractManagementView() {
  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="质押合约管理"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '合约操作台', href: paths.dashboard.lgns.rebaseRecord },
            { name: '质押合约管理' },
          ]}
          sx={{ mb: { xs: 2, md: 3 } }}
        />
        <Card
          sx={{
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: 80,
            flexDirection: { md: 'column' },
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 lg:gap-8">
            {bonds.map((bond, index) => (
              <BondCard key={index} {...bond} />
            ))}
          </div>

          <RebaseOperationQueueView />
        </Card>
      </DashboardContent>
    </>
  );
}

export default ContractManagementView;
