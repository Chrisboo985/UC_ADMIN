import { useState, useCallback, useEffect } from 'react';

import {
  Box,
  Card,
  Button,
  Container,
  TextField,
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useSettingsContext } from 'src/components/settings';
import { CellWithTooltipCopy } from '../user-table-cell';
import { getParentModifyLogAPI, type ParentModifyLogRequest, type ParentModifyLogItem } from 'src/api/user';

// ----------------------------------------------------------------------

type Filters = {
  member: string;
};

const defaultFilters: Filters = {
  member: '',
};

// ----------------------------------------------------------------------

export function ParentModifyLogView() {
  const router = useRouter();
  const settings = useSettingsContext();
  const loading = useBoolean();

  const [tableData, setTableData] = useState<ParentModifyLogItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });

  const filters = useSetState(defaultFilters);

  // 获取数据
  const fetchData = useCallback(async () => {
    try {
      loading.onTrue();
      const params: ParentModifyLogRequest = {
        member: filters.state.member || undefined,

        page: paginationModel.page + 1,
        page_size: paginationModel.pageSize,
      };

      const response = await getParentModifyLogAPI(params);
      if (response.code === 0) {
        setTableData(response.data.list || []);
        setTotalCount(response.data.total || 0);
      } else {
        toast.error('获取数据失败');
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      toast.error('获取数据失败');
    } finally {
      loading.onFalse();
    }
  }, [filters.state, paginationModel]);

  // 页面初始化时自动加载默认数据
  useEffect(() => {
    fetchData();
  }, []);

  // 处理搜索
  const handleSearch = useCallback(() => {
    setPaginationModel(prev => ({ ...prev, page: 0 })); // 重置到第一页
    fetchData();
  }, [fetchData]);



  // 表格列定义
  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: '记录ID',
      width: 100,
      sortable: false,
    },
    {
      field: 'member_code',
      headerName: '用户编码',
      width: 120,
      sortable: false,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member.member_code || '-'} />,
    },
    {
      field: 'h_username',
      headerName: '登录名',
      width: 120,
      sortable: false,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member.h_username || '-'} />,
    },
    {
      field: 'nickname',
      headerName: '用户昵称',
      width: 100,
      sortable: false,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member.h_nickname || '-'} />,
    },
    {
      field: 'address',
      headerName: '会员地址',
      width: 200,
      sortable: false,
        renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.member.address || '-'} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'new_parent_info',
      headerName: '新推荐人',
      width: 250,
      sortable: false,
      renderCell: (params) => {
        const newParent = params.row.new_parent;
        if (!newParent) return '-';
        return (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            py: 1,
            width: '100%',
            overflow: 'visible',
            justifyContent: 'center',
            minHeight: '60px'
          }}>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户编码: {newParent.member_code || '-'}
            </Box>
             <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              登录名: {newParent.h_username || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户昵称: {newParent.h_nickname || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', wordBreak: 'break-all', lineHeight: 1.2 }}>
              用户地址: {newParent.address || '-'}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'old_parent',
      headerName: '旧推荐人',
      width: 250,
      sortable: false,
      renderCell: (params) => {
        const old_parent = params.row.old_parent;
        if (!old_parent) return '-';
        return (
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            py: 1,
            width: '100%',
            overflow: 'visible',
            justifyContent: 'center',
            minHeight: '60px'
          }}>
            <Box sx={{ fontSize: '0.75rem',  lineHeight: 1.2 }}>
              用户编码: {old_parent.member_code || '-'}
            </Box>
             <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              登录名: {old_parent.h_username || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
              用户昵称: {old_parent.h_nickname || '-'}
            </Box>
            <Box sx={{ fontSize: '0.75rem', wordBreak: 'break-all', lineHeight: 1.2 }}>
              用户地址: {old_parent.address || '-'}
            </Box>
          </Box>
        );
      },
    },
    {
      field: 'updated_at_string',
      headerName: '更新时间',
      width: 180,
      sortable: false,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'migration_count',
      headerName: '迁移的网体用户数',
      width: 150,
      sortable: false,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'team_power_total',
      headerName: '迁移的网体总算力',
      width: 150,
      sortable: false,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'new_parent_ids_count',
      headerName: '用户新父级链总数',
      width: 150,
      sortable: false,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'old_parent_ids_count',
      headerName: '用户旧父级链总数',
      width: 150,
      sortable: false,
      renderCell: (params) => params.value || '-',
    }
  ];

  return (
    <Container maxWidth={settings.compactLayout ? 'lg' : false}>
      <CustomBreadcrumbs
        heading="查询修改推荐人记录"
        links={[
          { name: '数据概览', href: paths.dashboard.root },
          { name: '会员', href: paths.dashboard.user.root },
          { name: '查询修改推荐人记录' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 3 }}>
            <TextField
              value={filters.state.member}
              onChange={(event) => filters.setState({ member: event.target.value })}
              placeholder="请输入用户编码或者地址"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 240 }}
            />





            <Button
              variant="contained"
              onClick={handleSearch}
              startIcon={<Iconify icon="eva:search-fill" />}
              sx={{ minWidth: 120 }}
            >
              查询
            </Button>


          </Box>

          <DataGrid
            rows={tableData}
            columns={columns}
            loading={loading.value}
            pagination
            paginationMode="server"
            rowCount={totalCount}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 25, 50, 100]}
            disableRowSelectionOnClick
            disableColumnMenu
            getRowHeight={() => 'auto'}
            sx={{
              height: 600,
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem',
                paddingTop: 1,
                paddingBottom: 1,
                overflow: 'visible !important',
                whiteSpace: 'normal !important',
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-row': {
                maxHeight: 'none !important',
              },
            }}
            getRowId={(row) => row.id || Math.random()}
          />
        </Box>
      </Card>
    </Container>
  );
}
