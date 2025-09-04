import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';

import {
  Stack,
  Card,
  Button,
  
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  MenuItem,
  Link,
} from '@mui/material';

import Select from '@mui/material/Select';

import type { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';

import FormControl from '@mui/material/FormControl';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { useSetState } from 'src/hooks/use-set-state';
import { fNumber, fPercent } from 'src/utils/format-number';

import { paths } from 'src/routes/paths';
import {  airdropLogAPI ,getAirdropDetailsAPI} from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { varAlpha } from 'src/theme/styles';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';

import { CellWithTooltipCopy } from '../user-table-cell';

export interface ModelsGameHistoryAirport {
  id: number;
  member_address: string;
  amount: string;
  reward_amount: string;
  reward_type: string;
  take_off_success_count: number;
  status_string: string;
  end_type_string: string;
  is_cheat_string: string;
  created_at: number;
  created_at_string: string;
  updated_at: number;
  updated_at_string: string;
  ended_at_string: string;
  last_reported_at_string: string;
}

const FLAME_TYPES = [
  { value: 'dividend_rewards', label: '分红奖励' },
  { value: 'guild_subsidies', label: '社区补贴' },
  { value: 'governance', label: '治理' },
  { value: 'airdrop_rewards', label: '空投奖励' },
  { value: 'exclusive_events', label: '专属活动' },
];

export const NFTAirdropFlowView = memo(function GameHistoryAirportView() {
  const [filteredData, setFilteredData] = useState<ModelsGameHistoryAirport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [selectedAirdropId, setSelectedAirdropId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>({});
  const [auditStatus, setAuditStatus] = useState<any>('');

  // 庄家今日盈 庄家今日输
  const [total, setTotal] = useState<any>({
    win: 0,
    loss: 0,
  });

  const theme = useTheme();

  // 审核状态枚举
  const [assetTypeEnum, setAssetTypeEnum] = useState<any[]>([
    { value: 'nft_reward_amount', label: 'NFT奖励数量' },
    { value: 'plane_key_amount', label: '宝石奖励' },
  ]);

  const handleCloseForm = () => {
    setOpenDialog(false);
  };

  const filters = useSetState<any>({
    address: '',
    asset_type: '',
  });

  const filtersForEdit = useSetState<{
    address?: string;
    asset_type?: string;
  }>({
    address: '',
    asset_type: '',
  });

  const handleChangeAuditStatus = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      filtersForEdit.setState({
        asset_type: value === '' ? undefined : value,
      });
    },
    [filtersForEdit]
  );

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    // 获取时间参数，
    filters.setState({
      address: filtersForEdit.state.address,
      asset_type: filtersForEdit.state.asset_type,
    });
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const columns: GridColDef[] = [
    {
      field: 'address',
      headerName: '会员地址',
      flex: 1,
      align: 'center',
      renderCell: (params) => <CellWithTooltipCopy value={params.row.address} />,
    },
    {
      field: 'status',
      headerName: '状态',
      width: 120,
      align: 'center',
      renderCell: (params) => (
        <Chip
          label={params.row.status === 1 ? '成功' : '失败'}
          color={params.row.status === 1 ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'amount_change',
      headerName: '变动金额',
      width: 130,
      align: 'center',
    },
    {
      field: 'amount_before',
      headerName: '变动前金额',
      width: 130,
      align: 'center',
    },
    {
      field: 'amount_after',
      headerName: '变动后金额',
      width: 130,
      align: 'center',
    },
    {
      field: 'created_at',
      headerName: '创建时间',
      width: 180,
      renderCell: (params) => fDateTime(params.value, 'YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const getTogglableColumns = () => columns.map((column) => column.field);

  const CustomToolbar = () => (
    <Stack spacing={1} flexGrow={1} direction="row" alignItems="center" justifyContent="flex-end">
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
      </GridToolbarContainer>
    </Stack>
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
      address: filters.state.address,
      asset_type: filters.state.asset_type,
    };

    setLoading(true);
    try {
      const response = await getAirdropDetailsAPI(params);

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
  }, [pagination.page, pagination.pageSize, pagination, filters.state]);

  useEffect(() => {
    getList();
  }, [getList]);
  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="NFT空投记录"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '合约操作台', href: paths.dashboard.gameAirPortRush.root },
            { name: 'NFT空投记录' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
          // action={
          //   <Button variant="contained" onClick={() => setOpenDialog(true)}>
          //     创建空投
          //   </Button>
          // }
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
            spacing={1}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            sx={{ p: { xs: 2, md: 2 }, pb: 0 }}
            direction={{ xs: 'column', md: 'row' }}
          >
          

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.address}
                onChange={handleFilterAddress}
                placeholder="请输入地址"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
              <InputLabel htmlFor="bond-filter-select-label">审核状态</InputLabel>
              <Select
                value={filtersForEdit.state.asset_type || ''}
                onChange={handleChangeAuditStatus}
                input={<OutlinedInput label="审核状态" />}
                renderValue={(selected) => {
                  if (!selected) return '';
                  const selectedBond = assetTypeEnum.find(
                    (asset_type) => asset_type.value === selected
                  );
                  return selectedBond ? selectedBond.label : '';
                }}
                multiple={false}
                inputProps={{ id: 'bond-filter-select-label' }}
                sx={{ textTransform: 'capitalize' }}
              >
                {assetTypeEnum.map((asset_type) => (
                  <MenuItem key={asset_type.value} value={asset_type.value}>
                    {asset_type.label}
                  </MenuItem>
                ))}
                <MenuItem
                  value=""
                  sx={{
                    justifyContent: 'center',
                    fontWeight: (themer) => themer.typography.button,
                    border: (themer) =>
                      `solid 1px ${varAlpha(themer.vars.palette.grey['500Channel'], 0.16)}`,
                    bgcolor: (themer) => varAlpha(themer.vars.palette.grey['500Channel'], 0.08),
                  }}
                >
                  清除
                </MenuItem>
              </Select>
            </FormControl>

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>

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
