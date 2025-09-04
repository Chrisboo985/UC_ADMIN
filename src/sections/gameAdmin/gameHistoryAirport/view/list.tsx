import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';

import {
  Stack,
  Card,
  Button,
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
import { setAuditStatusAPI, getRecordListAPI, getPlaneGameStatisticAPI } from 'src/api/gameAdmin';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';

import { CellWithTooltipCopy } from '../user-table-cell';
import AirdropDetailDialog from './AirdropDetailDialog';
import { RemarkForm } from '../remark-form';

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

export const GameHistoryAirportView = memo(function GameHistoryAirportView() {
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
  const [auditStatusEnum, setAuditStatusEnum] = useState<any[]>([
    { value: 'auto_audit', label: '自动审核' },
    { value: 'user_audit', label: '待人工审核' },
    { value: 'pass', label: '审核通过' },
    { value: 'not_pass', label: '审核不通过' },
  ]);

  const handleCloseForm = () => {
    setOpenDialog(false);
  };

  // 设置审核状态
  const setAuditStatusMethod = async ({
    audit_status,
    remark,
    id,
  }: {
    audit_status: any;
    remark: string;
    id: number;
  }) => {
    const toastId = toast.loading('设置审核状态中');
    setAuditStatusAPI({ audit_status, remark, id })
      .then((res) => {
        if (res.code === 0) {
          toast.success('设置审核状态成功');
          return;
        }
        throw new Error('设置审核状态失败');
      })
      .catch((error) => toast.error('设置审核状态失败'))
      .finally(() => {
        toast.dismiss(toastId);
        getList();
      });
  };

  const filters = useSetState<any>({
    address: '',
    audit_status: '',
  });

  const filtersForEdit = useSetState<{
    address?: string;
    audit_status?: string;
  }>({
    address: '',
    audit_status: '',
  });

  const handleChangeAuditStatus = useCallback(
    (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      filtersForEdit.setState({
        audit_status: value === '' ? undefined : value,
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
      audit_status: filtersForEdit.state.audit_status,
    });
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', flex: 1 },
    {
      field: 'member_address',
      width: 280,
      headerName: '用户地址',
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member_address} />,
    },
    {
      field: 'audit_status',
      width: 200,
      headerName: '审核状态',
      renderCell: (params) => {
        const auditStatusMap: Record<string, string> = {
          auto_audit: '自动审核',
          user_audit: '待人工审核',
          pass: '审核通过',
          not_pass: '审核不通过',
        };
        return params.row.audit_status === 'user_audit' ? (
          <Select
            disabled={
              params.row.audit_status === 'auto_audit' ||
              params.row.audit_status === 'pass' ||
              params.row.audit_status === 'not_pass'
            }
            value={params.row.audit_status}
            onChange={(e) => {
              console.log('e.target.value', e.target.value);

              if (e.target.value === 'user_audit') {
                return;
              }
              //  设置需要审核的用户
              setCurrentUser(params.row);
              setAuditStatus(e.target.value);
              setOpenDialog(true);
              // 弹窗里
            }}
            sx={{
              ...(params.row.audit_status === 'user_audit' && {
                backgroundColor: 'rgba(255, 0, 0, 0.1)', // 未选择时增加样式
              }),
            }}
          >
            {Object.keys(auditStatusMap)
              .filter((key) => key !== 'auto_audit')
              .map((key) => (
                <MenuItem key={key} value={key}>
                  {/* @ts-ignore */}
                  {auditStatusMap[key]}
                </MenuItem>
              ))}
          </Select>
        ) : (
          <> {params.row.audit_status ? auditStatusMap[params.row.audit_status] : '-'}</>
        );
      },
    },
    {
      field: 'remark',
      width: 200,
      headerName: '审核意见',
      renderCell: (params) => <>{params.row.remark || '-'}</>,
    },
    { field: 'member_game_dyn_score', width: 150, headerName: '会员游戏动态分数' },
    { field: 'member_game_static_score', width: 150, headerName: '会员游戏静态分数' },
    { field: 'amount', width: 100, headerName: '数量' },

    { field: 'reward_amount', width: 180, headerName: '奖励数量' },

    {
      field: 'reward_type',
      width: 180,
      headerName: '奖励类型',
      renderCell: (params) => (
        <>{params.row.reward_type === 'RewardTypeBond' ? '债券' : params.row.reward_type}</>
      ),
    },
    { field: 'take_off_success_count', width: 100, headerName: '起飞成功次数' },
    { field: 'difficulty', width: 100, headerName: '游戏难度系数' },

    { field: 'status_string', width: 100, headerName: '状态' },
    { field: 'end_type_string', width: 100, headerName: '结束类型' },
    { field: 'is_cheat_string', width: 100, headerName: '作弊状态' },
    { field: 'created_at_string', width: 180, headerName: '创建时间' },
    { field: 'updated_at_string', width: 180, headerName: '更新时间' },
    { field: 'ended_at_string', width: 180, headerName: '结束时间' },
    { field: 'last_reported_at_string', width: 180, headerName: '最后上报时间' },
    {
      field: 'actions',
      headerName: '操作',
      width: 280,
      renderCell: (params) => (
        <>
          <Button
            onClick={() => {
              setSelectedAirdropId(params.row.id);
              setOpenDetail(true);
            }}
            color="primary"
          >
            查看事件
          </Button>
        </>
      ),
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
      member_address: filters.state.address,
      audit_status: filters.state.audit_status,
    };

    setLoading(true);
    try {
      const response = await getRecordListAPI(params);

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
    getPlaneGameStatisticAPI({}).then((res) => {
      if (res.code === 0 && res.data) {
        setTotal({
          win: res.data.today_win_amount,
          loss: res.data.today_lose_amount,
        });
      }
    });
  }, [getList]);
  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="游戏记录"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '游戏管理', href: paths.dashboard.gameAirPortRush.root },
            { name: '游戏记录' },
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
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'subtitle2' }}>庄家今日盈(Tcash)</Box>
                <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(total.win)}</Box>
              </Box>
            </FormControl>
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'subtitle2' }}>庄家今日输(Tcash)</Box>
                <Box sx={{ mt: 1.5, mb: 1, typography: 'h3' }}>{fNumber(total.loss)}</Box>
              </Box>
            </FormControl>

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
                value={filtersForEdit.state.audit_status || ''}
                onChange={handleChangeAuditStatus}
                input={<OutlinedInput label="审核状态" />}
                renderValue={(selected) => {
                  if (!selected) return '';
                  const selectedBond = auditStatusEnum.find(
                    (audit_status) => audit_status.value === selected
                  );
                  return selectedBond ? selectedBond.label : '';
                }}
                multiple={false}
                inputProps={{ id: 'bond-filter-select-label' }}
                sx={{ textTransform: 'capitalize' }}
              >
                {auditStatusEnum.map((audit_status) => (
                  <MenuItem key={audit_status.value} value={audit_status.value}>
                    {audit_status.label}
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

        {/* 详情弹窗 */}
        <AirdropDetailDialog
          open={openDetail}
          onClose={() => setOpenDetail(false)}
          airdropId={selectedAirdropId}
        />
      </DashboardContent>

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openDialog}
        onClose={handleCloseForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
          },
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>审核意见</DialogTitle>

        <RemarkForm
          currentEvent={currentUser}
          onClose={handleCloseForm}
          // 可选: 添加成功后的回调，用于刷新列表
          onSuccess={async (data) => {
            await setAuditStatusMethod({
              remark: data.remark,
              audit_status: auditStatus,
              id: currentUser.id,
            });

            handleCloseForm();
          }}
        />
      </Dialog>
    </>
  );
});
