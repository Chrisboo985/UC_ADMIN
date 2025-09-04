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

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import { varAlpha } from 'src/theme/styles';

import dayjs from 'dayjs';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { getBondPurchaseIndexAPI ,getBondPurchaseDataAPI} from 'src/api/finance';
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
export function BondPurchaseRecordsView() {
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
    purchase_method: 0, // 购买方式: 0 全部，1 ksp分叉买入，2 dapp买入
  });

  const filtersForEdit = useSetState<{
    bond_id?: number | undefined | null | '';
    member_id?: number | undefined | null | '';
    member_address?: string | undefined | null | '';
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    order_direction?: string;
    order_field?: string;
    purchase_method?: 0 | 1 | 2; // 购买方式: 0 全部，1 ksp分叉买入，2 dapp买入
  }>({
    bond_id: '',
    member_id: '',
    member_address: '',
    created_at_end: null,
    created_at_start: null,
    order_direction: '',
    order_field: '',
    purchase_method: 0, // 购买方式默认值为全部
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


  const [bondPurchaseData, setBondPurchaseData] = useState<any>({});

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

  // 获取债券列表数据
  const fetchBondData = async () => {
    try {
      const response = await getBondIndexAPI({


        page:1,
        page_size:100
      });

      console.log('response获取债券列表', response);
      if (response.data) {
        const bondData = response.data.list;
        // 按照ID进行升序排序
        setBonds(bondData);
      }
    } catch (error) {
      console.error('获取债券列表失败:', error);
      toast.error('获取债券列表失败!');
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchBondData();
    
  }, []);

  const getList = useCallback(async () => {
    const params = {
      ...filters.state,

      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setUsersLoading(true);
    await getBondPurchaseIndexAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          setFilteredData(data.list as ModelsBondPurchase & Bond[]);
          setTotalCount(data.total);
        } else {
          toast.error(apiResult.message);
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
    // filters.state.address,
    // filters.state.created_at_end,
    // filters.state.created_at_start,
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
      created_at_end: filtersForEdit.state.created_at_end?.endOf('day').unix(),
      purchase_method: filtersForEdit.state.purchase_method || 0, // 添加购买方式参数
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
    {
      field: 'id',
      headerName: '购买记录ID',
      description: '购买记录ID',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    },
    {
      field: 'contract_address',
      headerName: '合约地址',
      description: '合约地址',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.contract_address} />,
    },
    {
      field: 'bond_id',
      headerName: '债券id',
      description: '债券id',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.bond_id} />,
    },
    {
      field: 'Bond.name',
      headerName: '债券名称',
      description: '债券名称',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.Bond?.name || '-'} />,
    },
    {
      field: 'Bond.business_type_string',
      headerName: '债券类型',
      description: '债券类型',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.Bond?.business_type_string || '-'} />,
    },
    {
      field: 'member_id',
      headerName: '会员ID',
      description: '会员ID',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => 
        params.row.member_id ? (
          <CellWithTooltipCopy value={params.row.member_id} />
        ) : null,
    },
    {
      field: 'purchase_at',
      headerName: '购买时间',
      description: '购买时间字符串',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={dayjs(params.row.purchase_at * 1000).format('YYYY-MM-DD HH:mm:ss')} />,
    },
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

    {
      field: 'purchase_amount',
      headerName: '购买金额（USDT）',
      description: '购买金额（USDT）',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={round(params.row.purchase_amount, 10)} />,
    },
    {
      field: 'expected_amount',
      headerName: '应得数量',
      description: '应得数量',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={round(params.row.expected_amount, 10)} />,
    },
    {
      field: 'claimed_amount',
      headerName: '已领取数量',
      description: '已领取数量',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={round(params.row.claimed_amount, 10)} />,
    },

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
    {
      field: 'is_fully_claimed',
      headerName: '是否已全部领取',
      description: '是否已全部领取',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.is_fully_claimed ? '是' : '否'} />,
    },



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

  // 处理购买方式选择变化
  const handlePurchaseMethodChange = useCallback(
    (event: SelectChangeEvent<number>) => {
      filtersForEdit.setState({ purchase_method: Number(event.target.value) as 0 | 1 | 2 });
    },
    [filtersForEdit]
  );

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="债券购买记录"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '财务控制台', href: paths.dashboard.financialConsole.root },
            { name: '债券购买记录' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
          // action={
          //   <Stack
          //     spacing={1}
          //     alignItems={{ xs: 'flex-end', md: 'center' }}
          //     sx={{ p: { xs: 2, md: 2 }, pb: 0 }}
          //     direction={{ xs: 'column', md: 'row' }}
          //   >
          //     <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
          //       <FormControl component="fieldset" sx={{ flexGrow: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          //         <Box sx={{ mb: 1 }}>
          //           <Box sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>伞下KSN</Box>
          //         </Box>
          //         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>总额</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.KSP?.bond_tatol, 2)}</Box>
          //           </Box>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>本月</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.KSP?.month_bond, 2)}</Box>
          //           </Box>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>今日</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.KSP?.today_bond, 2)}</Box>
          //           </Box>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>本周</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.KSP?.week_bond, 2)}</Box>
          //           </Box>
          //         </Stack>
          //       </FormControl>
                
          //       <FormControl component="fieldset" sx={{ flexGrow: 1, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          //         <Box sx={{ mb: 1 }}>
          //           <Box sx={{ typography: 'subtitle1', fontWeight: 'bold' }}>伞下USDT</Box>
          //         </Box>
          //         <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%' }}>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>总额</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.USDT?.bond_tatol, 2)}</Box>
          //           </Box>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>本月</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.USDT?.month_bond, 2)}</Box>
          //           </Box>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>今日</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.USDT?.today_bond, 2)}</Box>
          //           </Box>
          //           <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          //             <Box sx={{ typography: 'caption', color: 'text.secondary' }}>本周</Box>
          //             <Box sx={{ typography: 'body1', fontWeight: 'bold' }}>{round(bondPurchaseData?.USDT?.week_bond, 2)}</Box>
          //           </Box>
          //         </Stack>
          //       </FormControl>
          //     </Stack>
          //   </Stack>
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



            <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
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
            </FormControl>

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
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
            </FormControl>

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

            {/* 购买方式选择下拉框 */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <FormControl fullWidth>
                <InputLabel id="purchase-method-label">购买方式</InputLabel>
                <Select
                  labelId="purchase-method-label"
                  value={filtersForEdit.state.purchase_method || 0}
                  onChange={handlePurchaseMethodChange}
                  label="购买方式"
                >
                  <MenuItem value={0}>全部</MenuItem>
                  <MenuItem value={1}>KSP分叉买入</MenuItem>
                  <MenuItem value={2}>DAPP买入</MenuItem>
                </Select>
              </FormControl>
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
                  ? fDateRangeShortLabel(
                      filtersForEdit.state.created_at_start,
                      filtersForEdit.state.created_at_end
                    )
                  : '选日期'}
              </Button>
              <CustomDateRangePicker
                variant="input"
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
