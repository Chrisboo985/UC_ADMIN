import type { ModelsBondPurchase, Bond } from 'src/types/bond';

import type { IDatePickerControl } from 'src/types/common';
import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import type { SelectChangeEvent } from '@mui/material/Select';
import { CONFIG } from 'src/config-global';
import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';
import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Divider from '@mui/material/Divider';
import { Paper, Chip } from '@mui/material';
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

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { varAlpha } from 'src/theme/styles';
import { getTeamIndexAPI, TeamIndexResponse } from 'src/api/user';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { getBondPurchaseIndexAPI } from 'src/api/finance';
import { getBondIndexAPI, BondData } from 'src/api/lgns';

import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function TeamPerformanceInquiryView() {
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  const filters = useSetState<ModelsBondPurchase & Bond>({
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
    member_address?: string | undefined | null | '';
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    order_direction?: string;
    order_field?: string;
  }>({
    bond_id: '',
    member_id: '',
    member_address: '',
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
  const [tableData, setTableData] = useState<ModelsBondPurchase & Bond[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ModelsBondPurchase & Bond[]>([]);
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
  // 统计信息
  const [statistics, setStatistics] = useState({
    fifty_days: '0', // 50 天统计结果
    five_days: '0', // 5 天统计结果
    hundred_days: '0', // 100 天统计结果
    three_hundred_days: '0', // 300 天统计结果
    two_hundred_days: '0', // 200 天统计结果
  });

  // 筛选条件是否能够重置
  const canReset =
    !!filtersForEdit.state.bond_id ||
    !!filtersForEdit.state.member_id ||
    !!filtersForEdit.state.member_address;

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

  const [bonds, setBonds] = useState<BondData[]>([]);

  // 组件加载时获取数据
  // useEffect(() => {
  //   getList();
  // }, []);

  const getList = useCallback(async () => {
    const params = {
      created_at_start: filters.state.created_at_start,
      created_at_end: filters.state.created_at_end,
      member_address: filters.state.member_address,
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    console.log('params', params);
    setUsersLoading(true);
    await getTeamIndexAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          const temp = {
            five_days: data.five_days.toString(), // 5 天统计结果
            fifty_days: data.fifty_days.toString(), // 50 天统计结果
            hundred_days: data.hundred_days.toString(), // 100 天统计结果
            three_hundred_days: data.three_hundred_days.toString(), // 300 天统计结果
            two_hundred_days: data.two_hundred_days.toString(), // 200 天统计结果
          };
          Object.keys(temp).forEach((key) => {
            temp[key as keyof typeof temp] = round(Number(temp[key as keyof typeof temp]), 2).toString();
          });

          setStatistics(temp);
          setFilteredData(data.list as TeamIndexResponse[]);
          setTotalCount(data.total as number);
        } else {
          toast.error(apiResult.message)
          setFilteredData([]);
          setTotalCount(0);
        }
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, [
    pagination.page,
    pagination.pageSize,
    filters.state,
    filters.state.member_address,
    filters.state.created_at_end,
    filters.state.created_at_start,
    // filters.state.id,
    // filters.state.order_direction,
    // filters.state.order_field,
  ]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据

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
      member_address: filtersForEdit.state.member_address || undefined,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.unix(),
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

  const handleFilterMemberAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ member_address: event.target.value });
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
        bonds={bonds}
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
      bonds,
      // eslint-disable-next-line
      // filtersForEdit.state,
      selectedRowIds,
      filteredData,
      setFilterButtonEl,
    ]
  );

  const columns: GridColDef[] = [
    // {
    //   field: 'id',
    //   headerName: '购买记录ID',
    //   description: '购买记录ID',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    // },
    // {
    //   field: 'bond_id',
    //   headerName: '债券ID',
    //   description: '债券ID',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.bond_id} />,
    // },

    {
      field: 'bond_type',
      headerName: '债券类型',
      description: '债券类型',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.bond?.type_string || '-'} />,
    },
    {
      field: 'bond.name',
      headerName: '债券名称',
      description: '债券名称',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.bond?.name} />,
    },

    // {
    //   field: 'member_id',
    //   headerName: '会员ID',
    //   description: '会员ID',
    //   minWidth: 120,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.member_id} />,
    // },
    {
      field: 'member_address',
      headerName: '会员地址',
      description: '会员地址',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.member_address} props={{ displayLength: 16 }} />
      ),
    },

    // {
    //   field: 'claimable',
    //   headerName: '可领取数量',
    //   description: '可领取数量',
    //   minWidth: 120,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.claimable, 10)} />,
    // },

    {
      field: 'purchase_amount',
      headerName: '购买金额（USDT）',
      description: '购买金额（USDT）',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={round(params.row.purchase_amount, 10)} />,
    },
    // {
    //   field: 'expected_amount',
    //   headerName: '应得数量',
    //   description: '应得数量',
    //   minWidth: 180,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.expected_amount, 10)} />,
    // },
    // {
    //   field: 'claimed_amount',
    //   headerName: '已领取数量',
    //   description: '已领取数量',
    //   minWidth: 120,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.claimed_amount, 10)} />,
    // },

    // {
    //   field: 'contract_address',
    //   headerName: '合约地址',
    //   description: '合约地址',
    //   minWidth: 220,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={params.row.contract_address} props={{ displayLength: 16 }} />
    //   ),
    // },
    // {
    //   field: 'discount',
    //   headerName: '折扣',
    //   description: '折扣',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={`${round(Number(params.row.discount) * 100, 4)}%`} />
    //   ),
    // },
    {
      field: 'hash',
      headerName: '唯一哈希',
      description: '唯一哈希',
      minWidth: 240,
      flex: 1,
      renderCell: (params) =>
        params.row.hash ? (
          <CellWithTooltipCopy
            value={params.row.hash}
            props={{
              displayLength: 24,
              onClick: () => {
                window.open(`${CONFIG.hexscanUrl}/tx/${params.row.hash}`, '_blank');
              },
            }}
          />
        ) : null,
    },
    // {
    //   field: 'interest',
    //   headerName: '利息',
    //   description: '利息',
    //   minWidth: 180,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.interest, 10)} />,
    // },

    // {
    //   field: 'is_fully_claimed',
    //   headerName: '是否已全部领取',
    //   description: '是否已全部领取',
    //   minWidth: 120,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={params.row.is_fully_claimed ? '是' : '否'} />
    //   ),
    // },

    {
      field: 'purchase_at_string',
      headerName: '购买时间',
      description: '购买时间字符串',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.purchase_at_string} />,
    },

    // {
    //   field: 'release_cycle',
    //   headerName: '释放周期',
    //   description: '释放周期',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.release_cycle} />,
    // },

    // {
    //   field: 'releasing',
    //   headerName: '释放中数量',
    //   description: '释放中数量',
    //   minWidth: 120,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.releasing, 10)} />,
    // },

    // Bond相关字段
    // {
    //   field: 'bond.control_variable',
    //   headerName: '控制变量',
    //   description: '控制变量',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.bond?.control_variable} />,
    // },
    // {
    //   field: 'bond.current_discount',
    //   headerName: '当前折扣',
    //   description: '当前折扣',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.bond?.current_discount} />,
    // },

    // 可写字段bond.discount
    // {
    //   field: 'bond.discount',
    //   headerName: '折扣',
    //   description: '折扣',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.bond?.discount} />,
    // },

    // {
    //   field: 'bond.enable_algorithm',
    //   headerName: '启用算法',
    //   description: '启用算法',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={params.row.bond?.enable_algorithm ? '是' : '否'} />
    //   ),
    // },
    // {
    //   field: 'bond.price',
    //   headerName: '价格（USDT）',
    //   description: '价格（USDT）',
    //   minWidth: 160,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.bond?.price, 6)} />,
    // },
    // {
    //   field: 'bond.purchased_amount',
    //   headerName: '已购买数量',
    //   description: '已购买数量',
    //   minWidth: 160,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={round(params.row.bond?.purchased_amount, 6)} />
    //   ),
    // },
    // {
    //   field: 'bond.roi',
    //   headerName: '当前折扣(ROI)',
    //   description: '当前折扣',
    //   minWidth: 160,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={round(params.row.bond?.roi, 6)} />,
    // },
    // // {
    // //   field: 'bond.status',
    // //   headerName: '状态',
    // //   description: '状态',
    // //   minWidth: 100,
    // //   flex: 1,
    // //   renderCell: (params) => <CellWithTooltipCopy value={params.row.bond?.status} />,
    // // },
    // {
    //   field: 'bond.total_supply',
    //   headerName: '债券总发行量',
    //   description: '债券总发行量',
    //   minWidth: 120,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={round(params.row.bond?.total_supply, 10)} />
    //   ),
    // },

    // {
    //   field: 'created_at_string',
    //   headerName: '创建时间',
    //   description: '创建时间字符串',
    //   minWidth: 200,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.created_at_string} />,
    // },
    // {
    //   field: 'updated_at_string',
    //   headerName: '更新时间',
    //   description: '更新时间字符串',

    //   minWidth: 200,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.updated_at_string} />,
    // },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const handleChangeBondId = useCallback(
    (event: SelectChangeEvent<number | ''>) => {
      const value = event.target.value;
      filtersForEdit.setState({
        bond_id: value === '' ? undefined : Number(value),
      });
    },
    [filtersForEdit]
  );

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="团队业绩查询"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
            { name: '团队业绩查询' },
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
            sx={{ p: { xs: 2, md: 2 }, pb: 0 }}
            direction={{ xs: 'column', md: 'row' }}
          >
            {/* <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
              <InputLabel htmlFor="bond-filter-select-label">债券</InputLabel>
              <Select
                value={filtersForEdit.state.bond_id || ''}
                onChange={handleChangeBondId}
                input={<OutlinedInput label="债券" />}
                renderValue={(selected) => {
                  if (!selected) return '';
                  const selectedBond = bonds.find((bond) => bond.id === selected);
                  return selectedBond ? selectedBond.name : '';
                }}
                multiple={false}
                inputProps={{ id: 'bond-filter-select-label' }}
                sx={{ textTransform: 'capitalize' }}
              >
                {bonds.map((bond) => (
                  <MenuItem key={bond.id} value={bond.id}>
                    {bond.name}
                  </MenuItem>
                ))}
                <MenuItem
                  value=""
                  sx={{
                    justifyContent: 'center',
                    fontWeight: (theme) => theme.typography.button,
                    border: (theme) =>
                      `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                  }}
                >
                  清除
                </MenuItem>
              </Select>
            </FormControl> */}

            {/* <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.member_id}
                onChange={handleFilterID}
                placeholder="请输入会员ID"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl> */}

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.member_address}
                onChange={handleFilterMemberAddress}
                placeholder="请输入会员地址"
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
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>
          <Divider />

          <Stack
            spacing={1}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            sx={{ p: { xs: 2, md: 2 }, pt: 0 }}
            direction={{ xs: 'column', md: 'row' }}
          >
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
            >
              <Paper>5天统计结果 <Chip sx={{ ml: 1 }} variant="outlined" label={statistics.five_days} /></Paper>
              <Paper>50天统计结果 <Chip sx={{ ml: 1 }} variant="outlined" label={statistics.fifty_days} /></Paper>
              <Paper>100天统计结果 <Chip sx={{ ml: 1 }} variant="outlined" label={statistics.hundred_days} /></Paper>
              <Paper>200天统计结果 <Chip sx={{ ml: 1 }} variant="outlined" label={statistics.two_hundred_days} /></Paper>
              <Paper>300天统计结果 <Chip sx={{ ml: 1 }} variant="outlined" label={statistics.three_hundred_days} /></Paper>
            </Stack>
          </Stack>
          <Divider />

          {/* 数据表格，采用服务端理数据模式 */}
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={filteredData}
            columns={columns}
            loading={usersLoading}
            // getRowHeight={() => 'auto'}
            pageSizeOptions={[10, 20, 50]}
            pagination
            sortingMode="server"
            filterMode="client"
            paginationMode="server"
            onPaginationModelChange={(model) => {
              console.log('更改页面列表', model);
              // fetch data from server
              setPagination({ page: model.page + 1, pageSize: model.pageSize });
            }}
            onSortModelChange={(model) => {
              // fetch data from server
              console.log('更改列表排序', model);

              if (model.length) {
                filters.setState({
                  order_direction: model[0].sort || undefined,
                  order_field: model[0].field || undefined,
                });
              } else {
                filters.setState({
                  order_direction: undefined,
                  order_field: undefined,
                });
              }
            }}
            onFilterModelChange={(model) => {
              // fetch data from server
              console.log('更改列表筛选', model);
            }}
            rowCount={totalCount}
            // estimatedRowCount={totalCount}
            paginationModel={{ page: pagination.page - 1, pageSize: pagination.pageSize }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: CustomToolbarCallback as GridSlots['toolbar'],
              noResultsOverlay: () => <EmptyContent title="返回数据为空" />,
            }}
            slotProps={{
              panel: { anchorEl: filterButtonEl },
              toolbar: { setFilterButtonEl },
              columnsManagement: { getTogglableColumns },
            }}
            sx={{
              [`& .${gridClasses.cell}`]: {
                alignItems: 'center',
                display: 'inline-flex',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              },
            }}
            // sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
          />
        </Card>
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
  bonds: BondData[];
  setFilterButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
}

function CustomToolbar({
  filtersForEdit,
  canReset,
  bonds,
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
        <UserTableFiltersResult
          filters={filtersForEdit}
          totalResults={0}
          bonds={bonds}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------
