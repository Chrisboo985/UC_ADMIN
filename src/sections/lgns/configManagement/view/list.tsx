import type {
  ModelsRebaseLog,
  ResponsesPagedResponseArrayModelsRebaseLog,
} from 'src/types/rebaselog';

import axios from 'axios';
import { toast } from 'src/components/snackbar';

import type { IDatePickerControl } from 'src/types/common';
import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { CONFIG } from 'src/config-global';
import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';
import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import Checkbox from '@mui/material/Checkbox'
import { round } from 'lodash-es';
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

import {
  getAllConfigAPI,
  setAllTeamStakeAPI,
  setCommunityRewardRateAPI,
  setIncrAllTeamStakeAPI,
  setIncrCommunityRewardRateAPI,
  setRebaseRateAPIForConfig,
  getLastDateAllStakeAmountAPI,
  updateConfig
} from 'src/api/lgns';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import {  type FormValueMap } from './list.types'
import { ApiPublicTypes } from 'src/api'
import dayjs from 'dayjs'
// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };
const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function ConfigManagementView() {
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  // 配置数据和加载状态
  const [configData, setConfigData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // last_date_all_stake_amount
  const [lastDateAllStakeAmount, setLastDateAllStakeAmount] = useState<any>(0);

  const [formValues, setFormValues] = useState<FormValueMap>({
    [ApiPublicTypes.ConfigItemKey.PreSaleStartDate]: '0',
    [ApiPublicTypes.ConfigItemKey.PurchaseBonusRate]: '0',
    [ApiPublicTypes.ConfigItemKey.NodeSaleSwitch]: '0',
    [ApiPublicTypes.ConfigItemKey.NftSaleSwitch]: '0',
    [ApiPublicTypes.ConfigItemKey.NftSaleStartTime]: '0',
  })

  // 获取配置数据
  const fetchConfigData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getAllConfigAPI();
      if (response.data && response.data) {
        setConfigData(response.data);

        // 初始化表单值 - 使用函数式更新避免依赖formValues
        setFormValues((prevFormValues) => {
          const newFormValues = { ...prevFormValues };
          response.data.forEach((item: { key: string; value: string }) => {
            if (item.key in formValues) {
              try {
                // 处理JSON格式的字符串
                const value = JSON.parse(item.value);
                (newFormValues as any)[item.key] =
                  typeof value === 'string' ? value : String(value);
              } catch (e) {
                (newFormValues as any)[item.key] = item.value.replace(/"/g, '');
              }
            }
          });
          return newFormValues;
        });
      }
    } catch (error) {
      console.error('Error fetching config data:', error);
      toast.error('获取配置数据失败');
    } finally {
      setIsLoading(false);
    }
  }, []); // 移除formValues依赖

  const fetchLastDateAllStakeAmount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getLastDateAllStakeAmountAPI({});
      if (response.data && response.data) {
        setLastDateAllStakeAmount(response.data);
      }
    } catch (error) {
      console.error('Error fetching last date all stake amount:', error);
      toast.error('获取last_date_all_stake_amount失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初始加载数据
  useEffect(() => {
    fetchConfigData();
    // fetchLastDateAllStakeAmount();
  }, [fetchConfigData]);

  // 更新表单值
  const handleInputChange = (key: ApiPublicTypes.ConfigItemKey, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 保存配置项
  const handleSaveConfig = async (key: ApiPublicTypes.ConfigItemKey) => {
    try {
      setIsLoading(true);
      await updateConfig(key, formValues[key]);

      toast.success('配置已更新');
      fetchConfigData(); // 刷新数据
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      toast.error(`更新失败`);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = useSetState<ModelsRebaseLog>({
    bond_id: undefined,
    member_id: undefined,
    created_at_end: 0,
    created_at_start: 0,
    order_direction: '',
    order_field: '',
  });

  const filtersForEdit = useSetState<{
    bond_id?: number | undefined | null | '';
    member_id?: number | undefined | null | '';
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    order_direction?: string;
    order_field?: string;
  }>({
    bond_id: '',
    member_id: '',
    created_at_end: null,
    created_at_start: null,
    order_direction: '',
    order_field: '',
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<ModelsRebaseLog[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ModelsRebaseLog[]>([]);
  // 总计
  const [totalCount, setTotalCount] = useState<number>(0);
  // 当前选中ID
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  // 筛选按钮元素
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  // 列显示模式
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  // 分页
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const [usersLoading, setUsersLoading] = useState<true | false>(false);

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.bond_id || !!filtersForEdit.state.member_id;

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
        // console.log('日期选择有效，更新最后有效日期');
      } else {
        // 如果日期验证失败，恢复为最后有效日期
        filtersForEdit.setState({
          created_at_start: lastValidDateRange.start || null,
          created_at_end: lastValidDateRange.end || null,
        });
        // console.log('日期选择无效，恢复上次有效日期');
      }
    }
  }, [
    openDateRange.value,
    dateError,
    filtersForEdit,
    lastValidDateRange.end,
    lastValidDateRange.start,
  ]);

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    // 获取时间参数，
    filters.setState({
      bond_id: filtersForEdit.state.bond_id || undefined,
      member_id: filtersForEdit.state.member_id || undefined,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.endOf('day').unix(),
    });
  };

  const handleViewRow = useCallback(
    (item: Object) => {
      console.log('查看详情', item);
      // router.push(paths.dashboard.product.details(id));
    },
    [] // Keep empty since it doesn't depend on external variables
  );

  const handleApply = (start: IDatePickerControl, end: IDatePickerControl) => {
    // 父组件接收到用户选择的数据

    filtersForEdit.setState({ created_at_start: start, created_at_end: end });
    console.log('Selected start date:', start?.format('YYYY-MM-DD'));
    console.log('Selected end date:', end?.format('YYYY-MM-DD'));
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ bond_id: Number(event.target.value) || undefined });
    },
    [filtersForEdit]
  );

  const handleFilterID = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ member_id: Number(event.target.value) || undefined });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const handleFilterHash = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ order_direction: event.target.value });
    },
    [filtersForEdit]
  );

  const memoizedFiltersForEdit = useMemo(
    () => ({
      state: filtersForEdit.state,
      setState: filtersForEdit.setState,
    }),
    [filtersForEdit.setState, filtersForEdit.state]
  );

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        canReset={canReset}
        filtersForEdit={memoizedFiltersForEdit}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={filteredData.length}
      />
    ),
    [
      canReset,
      memoizedFiltersForEdit,
      // eslint-disable-next-line
      // filtersForEdit.state,
      selectedRowIds,
      filteredData,
      setFilterButtonEl,
    ]
  );

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      description: 'Rebase记录ID',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    },
    {
      field: 'created_at_string',
      headerName: '创建时间',
      minWidth: 160,
      flex: 1,
    },
    {
      field: 'ended_at_string',
      headerName: '结束时间',
      minWidth: 160,
      flex: 1,
    },
    {
      field: 'status_string',
      headerName: '状态',
      minWidth: 120,
      flex: 1,
    },
    {
      field: 'rebase_rate',
      headerName: 'Rebase比率',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => `${(params.value * 100).toFixed(2)}%`,
    },
    {
      field: 'fee_amount',
      headerName: '手续费',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => round(params.value, 2),
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="配置管理"
          links={[{ name: '控制台', href: paths.dashboard.root }, { name: '配置管理' }]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Box sx={{ p: 3 }}>

          <Stack spacing={4}>
            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                节点认购
              </Typography>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack flex={1} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 350 }}>
                      <Typography variant="subtitle1">开始时间</Typography>
                      <Typography variant="body2" color="text.secondary">
                        设置预售开始时间
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 250 }}>
                      <DateTimePicker
                        format='YYYY-MM-DD HH:mm:ss'
                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                        label="请选择您的开始时间"
                        value={
                          formValues[ApiPublicTypes.ConfigItemKey.PreSaleStartDate] ?
                          dayjs(+formValues[ApiPublicTypes.ConfigItemKey.PreSaleStartDate] * 1000) :
                          null
                        }
                        onChange={ (e) => handleInputChange(ApiPublicTypes.ConfigItemKey.PreSaleStartDate, e ? e.unix().toString() : '') }
                      />
                    </Box>
                  </Stack>

                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => handleSaveConfig(ApiPublicTypes.ConfigItemKey.PreSaleStartDate)}
                  >
                    保存
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack flex={1} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 350 }}>
                      <Typography variant="subtitle1">开启</Typography>
                      <Typography variant="body2" color="text.secondary">
                        设置节点是否开启购买
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 250 }}>
                      <Checkbox
                        checked={ formValues[ApiPublicTypes.ConfigItemKey.NodeSaleSwitch] === 'on' }
                        onChange={ (e) => handleInputChange(ApiPublicTypes.ConfigItemKey.NodeSaleSwitch, e.target.checked ? 'on' : 'off') }
                      />
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => handleSaveConfig(ApiPublicTypes.ConfigItemKey.NodeSaleSwitch)}
                  >
                    保存
                  </Button>
                </Stack>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                NFT认购
              </Typography>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack flex={1} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 350 }}>
                      <Typography variant="subtitle1">开始时间</Typography>
                      <Typography variant="body2" color="text.secondary">
                        设置nft开售时间
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 250 }}>
                      <DateTimePicker
                        format='YYYY-MM-DD HH:mm:ss'
                        views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                        label="请选择您的开始时间"
                        value={
                          formValues[ApiPublicTypes.ConfigItemKey.NftSaleStartTime] ?
                          dayjs(+formValues[ApiPublicTypes.ConfigItemKey.NftSaleStartTime] * 1000) :
                          null
                        }
                        onChange={ (e) => handleInputChange(ApiPublicTypes.ConfigItemKey.NftSaleStartTime, e ? e.unix().toString() : '') }
                      />
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => handleSaveConfig(ApiPublicTypes.ConfigItemKey.NftSaleStartTime)}
                  >
                    保存
                  </Button>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack flex={1} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 350 }}>
                      <Typography variant="subtitle1">开启</Typography>
                      <Typography variant="body2" color="text.secondary">
                        设置nft是否开启购买
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 250 }}>
                      <Checkbox
                        checked={ formValues[ApiPublicTypes.ConfigItemKey.NftSaleSwitch] === 'on' }
                        onChange={ (e) => handleInputChange(ApiPublicTypes.ConfigItemKey.NftSaleSwitch, e.target.checked ? 'on' : 'off') }
                      />
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => handleSaveConfig(ApiPublicTypes.ConfigItemKey.NftSaleSwitch)}
                  >
                    保存
                  </Button>
                </Stack>
              </Stack>
            </Card>

            <Card variant="outlined" sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                认购奖金池比例
              </Typography>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Stack flex={1} direction="row" spacing={2}>
                    <Box sx={{ minWidth: 350 }}>
                      <Typography variant="subtitle1">全网U认购金额奖励占比</Typography>
                      <Typography variant="body2" color="text.secondary">
                        设置全网U认购金额奖励占比
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 250 }}>
                      <TextField
                        fullWidth
                        label="当前值"
                        inputProps={{ min: 0, max: 0.999, step: 0.001 }}
                        value={formValues[ApiPublicTypes.ConfigItemKey.PurchaseBonusRate]}
                        onChange={(e) => handleInputChange(ApiPublicTypes.ConfigItemKey.PurchaseBonusRate, e.target.value)}
                        sx={{ mr: 1 }}
                      />
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    disabled={isLoading}
                    onClick={() => handleSaveConfig(ApiPublicTypes.ConfigItemKey.PurchaseBonusRate)}
                  >
                    保存
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Box>
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
