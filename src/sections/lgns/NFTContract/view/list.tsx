import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';

import {
  colors as Theme,
  Stack,
  Card,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { airdropLogAPI } from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AirdropTcashForm from './AirdropTcashForm';
import AirdropDetailDialog from './AirdropDetailDialog';

export interface ModelsContractTask {
  amount: number;
  created_at: number;
  created_at_string: string;
  id: number;
  type: string;
  updated_at: number;
  updated_at_string: string;
}

const FLAME_TYPES = [
  { value: 'dividend_rewards', label: '分红奖励' },
  { value: 'guild_subsidies', label: '社区补贴' },
  { value: 'governance', label: '治理' },
  { value: 'airdrop_rewards', label: '空投奖励' },
  { value: 'exclusive_events', label: '专属活动' },
];

export const NFTContractView = memo(function NFTContractView() {
  const [filteredData, setFilteredData] = useState<ModelsContractTask[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedAirdropId, setSelectedAirdropId] = useState<string>('');

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1 },
    { field: 'asset_type', headerName: '资产类型', flex: 1,
      renderCell: (params) => {
        if (params.row.asset_type === '') {
          return '-';
        }

        // 如果不为空，旧对应字符串
        // 资产类型 nft_reward_amount[tcash] plane_key_amount[宝石]
        return params.row.asset_type === 'nft_reward_amount' ? 'tcash' : '宝石';
      }

     },
    {
      field: 'type',
      headerName: '类型',
      flex: 1,
      renderCell: (params) =>
        FLAME_TYPES.find((item) => item.value === params.row.type)?.label || params.row.type,
    },
    { field: 'amount', headerName: '数量', flex: 1 },
    { field: 'created_at_string', headerName: '创建时间', flex: 1 },
    { field: 'updated_at_string', headerName: '更新时间', flex: 1 },
    {
      field: 'actions',
      headerName: '操作',
      width: 120,
      renderCell: (params) => (
        <Button
          onClick={() => {
            setSelectedAirdropId(params.row.id);
            setOpenDetail(true);
          }}
          color="primary"
        >
          查看详情
        </Button>
      ),
    },
  ];

  const getTogglableColumns = () => columns.map((column) => column.field);

  const CustomToolbar = () => (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  // 处理表单提交成功
  const handleFormSuccess = () => {
    setOpenDialog(false);
    // TODO: 刷新列表数据
    setPagination({ page: 1, pageSize: 10 });
  };

  const getList = useCallback(async () => {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setLoading(true);
    try {
      const response = await airdropLogAPI(params);

      if (response.code === 0 && response.data) {
        const list = (response.data.list || []).map((item: any) => ({
          ...item,
          id: item.ID || item.id,
        }));

        setFilteredData(list);
        setTotalCount(response.data.total || 0);
      } else {
        toast.error(response.message);
        setFilteredData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch contract tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, pagination]);

  useEffect(() => {
    getList();
  }, [getList]);
  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="NFT合约管理"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '合约操作台', href: paths.dashboard.lgns.rebaseRecord },
            { name: 'NFT合约管理' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
          action={
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
              创建空投
            </Button>
          }
        />

        <Card
        
        
        sx={{
          flexGrow: { md: 1 },
          display: { md: 'flex' },
          height: { xs: 800, md: 2 },
          flexDirection: { md: 'column' },
        }}
        >
          <DataGrid
            rows={filteredData}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            paginationModel={{
              page: pagination.page - 1,
              pageSize: pagination.pageSize,
            }}
            onPaginationModelChange={(model) => {
              setPagination({
                page: model.page + 1,
                pageSize: model.pageSize,
              });
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            rowCount={totalCount}
            getRowHeight={() => 'auto'}
            slots={{
              toolbar: CustomToolbar,
              noRowsOverlay: () => (
                <EmptyContent
                  filled
                  title="暂无数据"
                  sx={{
                    height: '100%',
                  }}
                />
              ),
              noResultsOverlay: () => (
                <EmptyContent
                  filled
                  title="无查询结果"
                  sx={{
                    height: '100%',
                  }}
                />
              ),
            }}
            slotProps={{
              columnsManagement: { getTogglableColumns },
            }}
            sx={{
              height: 600,
              '& .MuiDataGrid-cell': {
                cursor: 'pointer',
                padding: '8px 14px',
              },
            }}
          />
        </Card>

        {/* 空投表单弹窗 */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>创建空投</DialogTitle>
          <DialogContent>
            <AirdropTcashForm onSuccess={handleFormSuccess} onCancel={() => setOpenDialog(false)} />
          </DialogContent>
        </Dialog>

        {/* 详情弹窗 */}
        <AirdropDetailDialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          airdropId={selectedAirdropId}
        />
      </DashboardContent>
    </>
  );
});
