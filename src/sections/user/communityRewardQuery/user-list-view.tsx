/*


1、【等待】更换logo
2、【完成】隐藏多余导航
3、【完成】完成列表多语言切换脚手架
4、【完成】隐藏多余功能和按钮
5、单元格选中复制组件；
6、【完成】放开筛选功能；
7、【完成】日期组件选中复制等；
8、【完成】表单，筛选，体验 
9、表单报错问题

*/

import type { UseSetStateReturn } from 'src/hooks/use-set-state';
import type { IUserItemforlist, IUserTableFiltersForList } from 'src/types/user';
import type { IDatePickerControl } from 'src/types/common';
import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { useTheme } from '@mui/material/styles';
import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';
import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { round } from 'lodash-es';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import { IconButton, MenuItem } from '@mui/material';

import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';

import { toast } from 'src/components/snackbar';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import { getRewardSearchAPI } from 'src/api/user';

import { getBondIndexAPI, BondData } from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import { RemarkForm } from '../remark-form';
import { PledgeForm } from '../pledge-form';
import { BondDividendWithdrawalForm } from '../bondDividendWithdrawal-form';
import { ReduceTurbineForm } from '../reduceTurbine-form';
import { CkBuyNumForm } from '../ckBuyNum-form';
import { DifficultyForm } from '../difficulty-form';

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function CommunityRewardQueryPage() {
  const openDateRange = useBoolean();
  const [loading, setLoading] = useState(false);
  const [rewardSearchResult, setRewardSearchResult] = useState<{
    community_bonus_create_sum: number;
    team_bonus_create_sum: number;
  }>({
    community_bonus_create_sum: 0,
    team_bonus_create_sum: 0,
  });
  const filters = useSetState<IUserTableFiltersForList>({
    address: '',
    created_at_end: 0,
    created_at_start: 0,
    order_field: '',
  });

  const filtersForEdit = useSetState<{
    address?: string;
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    order_field?: string;
  }>({
    address: '',
    created_at_end: null,
    created_at_start: null,
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

  // 监听日期验证和弹窗关闭
  useEffect(() => {
    if (!openDateRange.value) {
      // 当弹窗关闭时，如果日期有效（没有错误），保存当前选择的日期
      if (!dateError) {
        setLastValidDateRange({
          start: filtersForEdit.state.created_at_start,
          end: filtersForEdit.state.created_at_end,
        });
      } else {
        // 如果日期验证失败，恢复为最后有效日期
        filtersForEdit.setState({
          created_at_start: lastValidDateRange.start || null,
          created_at_end: lastValidDateRange.end || null,
        });
      }
    }
  }, [
    openDateRange.value,
    dateError,
    filtersForEdit,
    lastValidDateRange.end,
    lastValidDateRange.start,
  ]);

  // 查询会员业绩
  const fetchRewardData = useCallback(async (params: {
    address?: string;
    created_at_end?: number;
    created_at_start?: number;
  }) => {
    try {
      setLoading(true);
      const res = await getRewardSearchAPI(params);
      if (res.code === 0) {
        setRewardSearchResult(res.data);
      } else {
        toast.error(res.message || '查询失败');
      }
    } catch (error) {
      toast.error('查询出错，请重试');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const { address, created_at_start, created_at_end } = filters.state;
    if (!address && !created_at_start && !created_at_end) {
      return;
    }
    
    fetchRewardData({
      address,
      created_at_end,
      created_at_start,
    });
  }, [filters.state, fetchRewardData]);

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    // 验证地址是否填写
    if (!filtersForEdit.state.address?.trim()) {
      toast.error('请输入地址');
      return;
    }

    // 如果日期验证失败，不执行查询
    if (dateError) {
      toast.error('日期范围选择有误');
      return;
    }

    filters.setState({
      address: filtersForEdit.state.address,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.unix(),
    });
  };

  const handleApply = (start: IDatePickerControl, end: IDatePickerControl) => {
    // 父组件接收到用户选择的数据

    filtersForEdit.setState({ created_at_start: start, created_at_end: end });
    console.log('Selected start date:', start?.format('YYYY-MM-DD'));
    console.log('Selected end date:', end?.format('YYYY-MM-DD'));
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="社区奖励查询"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
            { name: '社区奖励查询' },
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
            spacing={1}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            sx={{ p: { xs: 2, md: 2 } }}
            direction={{ xs: 'column', md: 'row' }}
          >
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                required
                value={filtersForEdit.state.address}
                onChange={handleFilterAddress}
                placeholder="请输入地址"
                error={loading && !filtersForEdit.state.address?.trim()}
                helperText={loading && !filtersForEdit.state.address?.trim() ? '请输入地址' : ''}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

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
              <Button 
                variant="contained" 
                onClick={handleFilterData}
                disabled={loading || dateError || !filtersForEdit.state.address?.trim()}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? '查询中...' : '查询'}
              </Button>
            </FormControl>
          </Stack>

          <Box sx={{ px: 2, pb: 2, pt: 6 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Card sx={{ p: 3, maxWidth: 500, width: '100%' }}>
                <Stack spacing={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon="mdi:account-group" sx={{ width: 40, height: 40, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        社区奖励
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'primary.main' }}>
                        {rewardSearchResult.community_bonus_create_sum.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Iconify icon="mdi:trophy-variant" sx={{ width: 40, height: 40, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        团队奖励
                      </Typography>
                      <Typography variant="h4" sx={{ color: 'warning.main' }}>
                        {rewardSearchResult.team_bonus_create_sum.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            </Box>
          </Box>
        </Card>


        {/* 数据表格，采用服务端管理数据模式 */}
      </DashboardContent>
    </>
  );
}

// ----------------------------------------------------------------------

// 自定义工具栏组件
interface CustomToolbarProps {
  canReset: boolean;
  filteredResults: number;
  selectedRowIds: GridRowSelectionModel;
  filtersForEdit: any;
  setFilterButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}

function CustomToolbar({
  filtersForEdit,
  canReset,
  selectedRowIds,
  filteredResults,
  setFilterButtonEl,
}: CustomToolbarProps) {
  return (
    <>
      <GridToolbarContainer>
        <Stack
          spacing={1}
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport />
        </Stack>
      </GridToolbarContainer>
      {canReset && (
        <UserTableFiltersResult filters={filtersForEdit} totalResults={0} sx={{ p: 2.5, pt: 0 }} />
      )}
    </>
  );
}

// ----------------------------------------------------------------------
