import type { GridColDef } from '@mui/x-data-grid';
import { useState, useEffect, useCallback, memo } from 'react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

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

import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';
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

import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { useSetState } from 'src/hooks/use-set-state';
import { fNumber, fPercent } from 'src/utils/format-number';

import { useBoolean } from 'src/hooks/use-boolean';
import { paths } from 'src/routes/paths';
import { setAuditStatusAPI, getPlaneGameRankingAPI } from 'src/api/gameAdmin';
import { DashboardContent } from 'src/layouts/dashboard';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { varAlpha } from 'src/theme/styles';

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

export const GameRankingView = memo(function GameRankingView() {
  const [filteredData, setFilteredData] = useState<ModelsGameHistoryAirport[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);

  const [selectedAirdropId, setSelectedAirdropId] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<any>({});
  const [auditStatus, setAuditStatus] = useState<any>('');

  
  const openDateRange = useBoolean();


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
 

  const handleApply = (start: any , end: any) => {
    // 父组件接收到用户选择的数据

    filtersForEdit.setState({ created_at_start: start, created_at_end: end });
    console.log('Selected start date:', start?.format('YYYY-MM-DD'));
    console.log('Selected end date:', end?.format('YYYY-MM-DD'));
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
    created_at_start: dayjs().startOf('day').unix(),
    created_at_end: dayjs().endOf('day').unix(),
  });

  const getTodayTimestamps = () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    return {
      start: startOfToday,
      end: endOfToday,
    };
  };

  
  const filtersForEdit = useSetState<{
    created_at_start?: any;
    created_at_end?: any;
  }>({
    created_at_start: dayjs().startOf('day'),
    created_at_end: dayjs().endOf('day'),
  });


  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

 
  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    // 获取时间参数，
    filters.setState({
      
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.unix(),
    });
  };


  const columns: GridColDef[] = [
    { field: 'address', headerName: '地址', width: 300, flex: 1 },
    { field: 'member_id', headerName: '会员ID', width: 100, flex: 1 },
    { field: 'total_net_profit', headerName: '总净盈利', width: 100, flex: 1 },
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
      created_at_end: filters.state.created_at_end,
      created_at_start: filters.state.created_at_start,
    };

    setLoading(true);
    try {
      const response = await getPlaneGameRankingAPI(params);

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
          heading="游戏排名"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '游戏管理', href: paths.dashboard.gameAirPortRush.root },
            { name: '游戏排名' },
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
           
            
            {/* 选择日期范围 */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button
                color="inherit"
                onClick={openDateRange.onTrue}
                endIcon={
                  <Iconify
                    icon={
                      openDateRange ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'
                    }
                    sx={{ ml: -0.5 }}
                  />
                }
              >
                {!!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end
                  ? `${filtersForEdit.state.created_at_start.format(
                      'YYYY-MM-DD HH:mm'
                    )} - ${filtersForEdit.state.created_at_end.format('YYYY-MM-DD HH:mm')}`
                  : '选日期'}
              </Button>
              <CustomDateRangePicker
                variant="calendar"
                startDate={filtersForEdit.state.created_at_start}
                endDate={filtersForEdit.state.created_at_end}
                open={openDateRange.value}
                onClose={openDateRange.onFalse}
                onApply={handleApply}
                selected={
                  !!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end
                }
                error={dateError}
              />
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
            getRowId={(row) => row.member_id}
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
