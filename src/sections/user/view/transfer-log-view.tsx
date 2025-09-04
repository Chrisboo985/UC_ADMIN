import { useState, useCallback, useEffect } from 'react';

import {
  Box,
  Card,
  Button,
  Container,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { CellWithTooltipCopy } from '../user-table-cell';
import { getTransferLogAPI, type TransferLogRequest, type TransferLogItem } from 'src/api/user';

// ----------------------------------------------------------------------

type Filters = {
  from_member: string;
  to_member: string;
  type: string;
};

const defaultFilters: Filters = {
  from_member: '',
  to_member: '',
  type: '',
};

const defaultFiltersForEdit: Filters = {
  from_member: '',
  to_member: '',
  type: '',
};

// ----------------------------------------------------------------------

export function TransferLogView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const loading = useBoolean();

  const [tableData, setTableData] = useState<TransferLogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const filters = useSetState(defaultFilters);
  const filtersForEdit = useSetState(defaultFiltersForEdit);

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      loading.onTrue();
      const params: TransferLogRequest = {
        from_member: filters.state.from_member || undefined,
        to_member: filters.state.to_member || undefined,
        type: filters.state.type ? filters.state.type.toLowerCase() : undefined,
        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      };

      const response = await getTransferLogAPI(params);
      if (response.code === 0) {
        setTableData(response.data.list || []);
        setTotalCount(response.data.total || 0);
      } else {
        toast.error(response.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      toast.error('网络错误，请稍后重试');
    } finally {
      loading.onFalse();
    }
  }, [filters.state.from_member, filters.state.to_member, filters.state.type, paginationModel.page, paginationModel.pageSize]);

  // 页面初始化和分页变化时获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 处理搜索
  const handleSearch = useCallback(() => {
    // 将编辑状态同步到查询状态
    filters.setState({
      from_member: filtersForEdit.state.from_member,
      to_member: filtersForEdit.state.to_member,
      type: filtersForEdit.state.type,
    });
    setPaginationModel(prev => ({ ...prev, page: 0 })); // 重置到第一页
  }, [filters, filtersForEdit.state]);



  // 表格列定义
  const columns: GridColDef[] = [
     {
      field: 'id',
      headerName: '记录iD',
      width: 80,
    },
    {
      field: 'created_at_string',
      headerName: '时间',
      width: 180,
    },
    {
      field: 'from_member',
      headerName: '发送账户',
      width: 280,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            py: 1,
            width: '100%',
            overflow: 'visible',
            justifyContent: 'center',
            minHeight: '80px'
          }}>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户ID: {row.from_member_id || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2, }}>
              用户编码: {row.from_member_code || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户昵称: {row.from_member_nickname || '-'}
            </Box>
              <Box sx={{ fontSize: '0.75rem', wordBreak: 'break-all', lineHeight: 1.2 }}>
              用户地址: {row.from_member_address || '-'}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'to_member',
      headerName: '接收账户',
      width: 280,
      renderCell: (params) => {
        const row = params.row;
        return (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            py: 1,
            width: '100%',
            overflow: 'visible',
            justifyContent: 'center',
            minHeight: '80px'
          }}>
             <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户ID: {row.to_member_id || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem',lineHeight: 1.2,}}>
              用户编码: {row.to_member_code || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户昵称: {row.to_member_nickname || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', wordBreak: 'break-all', lineHeight: 1.2 }}>
              用户地址: {row.to_member_address || '-'}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'amount',
      headerName: '金额',
      width: 120,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'type',
      headerName: '币种',
      width: 100,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'remark',
      headerName: '转账备注',
      width: 200,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'hash',
      headerName: '交易哈希',
      width: 200,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.value || '-'} />
      ),
    },
  ];

  return (
    <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="转账记录查询"
        links={[
          { name: '数据概览', href: paths.dashboard.root },
          { name: '会员', href: paths.dashboard.user.root },
          { name: '转账记录查询' },
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
        <Stack
          spacing={2}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          sx={{ p: { xs: 2, md: 2 }, pb: 0 }}
          direction={{ xs: 'column', md: 'row' }}
        >
          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 280 } }}>
            <TextField
              fullWidth
              value={filtersForEdit.state.from_member}
              onChange={(event) => filtersForEdit.setState({ from_member: event.target.value })}
              placeholder="请输入发送账户编码或地址"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:arrow-up-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 280 } }}>
            <TextField
              fullWidth
              value={filtersForEdit.state.to_member}
              onChange={(event) => filtersForEdit.setState({ to_member: event.target.value })}
              placeholder="请输入接收账户编码或地址"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:arrow-down-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 150 } }}>
            <InputLabel>请选择币种</InputLabel>
            <Select
              value={filtersForEdit.state.type}
              onChange={(event) => filtersForEdit.setState({ type: event.target.value })}
              label="请选择币种"
              sx={{
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="tp">TP</MenuItem>
              <MenuItem value="up">UP</MenuItem>
              <MenuItem value="rp">RP</MenuItem>
              <MenuItem value="hp">HP</MenuItem>
              <MenuItem value="cp">CP</MenuItem>
            </Select>
          </FormControl>

          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 120 } }}>
            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<Iconify icon="eva:search-fill" />}
              sx={{
                minWidth: 120,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: 2,
                },
              }}
            >
              查询
            </Button>
          </FormControl>


        </Stack>

        <DataGrid
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnSorting
          rows={tableData}
          columns={columns}
          loading={loading.value}
          pageSizeOptions={[10, 20, 50]}
          pagination
           disableColumnMenu
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => {
            setPaginationModel(newModel);
          }}
          rowCount={totalCount}
          getRowId={(row) => row.id || Math.random()}
          getRowHeight={() => 'auto'}
          slots={{
            noResultsOverlay: () => <EmptyContent title="暂无转账记录" />,
          }}
          sx={{
            flexGrow: 1,
            minHeight: 400,
            '& .MuiDataGrid-root': {
              border: 'none',
            },
            '& .MuiDataGrid-main': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-row': {
              maxHeight: 'none !important',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
            '& .MuiDataGrid-cell': {
              fontSize: '0.875rem',
              paddingTop: 1,
              paddingBottom: 1,
              overflow: 'visible !important',
              whiteSpace: 'normal !important',
              display: 'flex',
              alignItems: 'center',
              lineHeight: 'unset !important',
              maxHeight: 'none !important',
              wordWrap: 'break-word',
              borderBottom: '1px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'background.neutral',
              borderRadius: 0,
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: '1px solid',
              borderColor: 'divider',
            },
          }}
        />
      </Card>
    </DashboardContent>
  );
}
