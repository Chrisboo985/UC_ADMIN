import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';

import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { getContractTaskIndexAPI, repushContractTaskAPI } from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// ----------------------------------------------------------------------

export interface ModelsContractTask {
  created_at?: number;
  event?: string;
  event_id?: number;
  id?: number;
  max_retries?: number;
  method_name?: string;
  params?: { [key: string]: any };
  result?: string;
  retry_count?: number;
  status?: string;
  tx_hash?: string;
  updated_at?: number;
}

// ----------------------------------------------------------------------

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

function CustomToolbar() {
  return (
    <GridToolbarContainer>
      <Stack spacing={1} direction="row" alignItems="center">
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport
          csvOptions={{
            fileName: `合约任务列表_${new Date().toLocaleDateString()}`,
          }}
        />
      </Stack>
    </GridToolbarContainer>
  );
}

// ----------------------------------------------------------------------

export const ContractTaskView = memo(function ContractTaskView() {
  const [filteredData, setFilteredData] = useState<ModelsContractTask[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);

  const handleRepush = async (id: number | undefined) => {
    if (!id) {
      toast.error('任务ID不能为空');
      return;
    }

    try {
      const response = await repushContractTaskAPI(id);
      if (response.code === 0) {
        toast.success('重推任务成功');
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '重推任务失败');
      }
    } catch (error) {
      console.error('Failed to repush task:', error);
      toast.error('重推任务失败');
    }
  };

  const getList = useCallback(async () => {
    const params = {
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setLoading(true);
    try {
      console.log('Fetching contract tasks with params:', params);
      const response = await getContractTaskIndexAPI(params);
      console.log('API response:', response);

      if (response.code === 0 && response.data) {
        const list = (response.data.list || []).map((item: any) => ({
          ...item,
          id: item.ID || item.id,
        }));

        console.log('Processed list:', list);
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
  }, [pagination.page, pagination.pageSize]);

  useEffect(() => {
    getList();
  }, [getList]);

  const columns: GridColDef<ModelsContractTask>[] = [
    {
      field: 'id',
      headerName: 'ID',
      flex: 1,
      filterable: true,
    },
    {
      field: 'tx_hash',
      headerName: '交易哈希',
      flex: 2,
      filterable: true,
    },
    {
      field: 'created_at',
      headerName: '调用时间',
      flex: 1.5,
      filterable: true,
      valueFormatter: (_, record) => {
        if (!record.created_at) return '';
        return new Date(record.created_at * 1000).toLocaleString();
      },
    },
    {
      field: 'status',
      headerName: '状态',
      flex: 1,
      filterable: true,
    },
    {
      field: 'actions',
      headerName: '操作',
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={() => handleRepush(params.row.id)}
        >
          重推任务
        </Button>
      ),
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="合约任务列表"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '合约操作台', href: paths.dashboard.lgns.rebaseRecord },
            { name: '合约任务列表' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
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
      </DashboardContent>
    </>
  );
});

export default ContractTaskView;
