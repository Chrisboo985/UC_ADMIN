import { useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
// @mui
import {
  Box,
  Card,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  FormControlLabel,
  Checkbox,
  Stack,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridSlots,
  GridColumnVisibilityModel,
  gridClasses,
} from '@mui/x-data-grid';
// hooks
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
// utils
import { fIsAfter } from 'src/utils/format-time';
// routes
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
// components
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
// api
import { getMemberPerformanceBondPurchase } from 'src/api/user';
import { getBondIndexAPI, BondData } from 'src/api/lgns';
// types
import type { IDatePickerControl } from 'src/types/common';
import { IUserTableFiltersForList, IBondPurchaseItem } from 'src/types/user';
// sections
import { UserTableFiltersResult } from '../user-table-filters-result';
import { CellWithTooltipCopy } from '../user-table-cell';


// ----------------------------------------------------------------------

// 要隐藏的列
const HIDE_COLUMNS = {
  // hash: false,
  // member_address: false,
};

// 要隐藏的可切换列
const HIDE_COLUMNS_TOGGLABLE: string[] = [
  // 'hash',
];

// ----------------------------------------------------------------------

export default function UserListView() {
  const theme = useTheme();
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  const confirm = useBoolean();

  const filters = useSetState<IUserTableFiltersForList>({
    address: '',
    created_at_end: 0,
    created_at_start: 0,
    id: undefined,
    order_direction: '',
    order_field: '',
    last_login_ip: '',
    remark: '',
    type: undefined,
    only_member: false, // 查询单个用户（运营中心/社区：false；单个用户：true）
    member_code: '', // 用户编码
    bond_id: undefined, // 债券ID
    purchase_method: 0, // 购买方式: 0 全部，1 ksp分叉买入, 2 dapp买入
  });

  const filtersForEdit = useSetState<{
    address?: string;
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    id?: number | undefined | null | '';
    order_direction?: string;
    order_field?: string;
    last_login_ip: string;
    remark?: string;
    type?: number;
    only_member?: boolean;
    member_code?: string;
    bond_id?: number | undefined;
    purchase_method?: 0 | 1 | 2;
  }>({
    address: '',
    created_at_end: null,
    created_at_start: null,
    id: '',
    order_direction: '',
    order_field: '',
    last_login_ip: '',
    remark: '',
    type: undefined,
    only_member: false,
    member_code: '',
    bond_id: undefined,
    purchase_method: 0,
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<IBondPurchaseItem[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<IBondPurchaseItem[]>([]);
  // 总计
  const [totalCount, setTotalCount] = useState<number>(0);
  // 债券购买统计数据
  const [bondStats, setBondStats] = useState<{
    usdt_amount: string;
    expected_ksp_amount: string;
    calc_ksp_amount: string;
  }>({    
    usdt_amount: '0',
    expected_ksp_amount: '0',
    calc_ksp_amount: '0',
  });
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
  const { copy } = useCopyToClipboard();
  
  // 债券列表
  const [bonds, setBonds] = useState<BondData[]>([]);

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.address || !!filtersForEdit.state.id || !!filtersForEdit.state.remark || filtersForEdit.state.bond_id !== undefined;

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );
 
  // 获取债券列表数据
  const fetchBondData = async () => {
    try {
      const response = await getBondIndexAPI({
        page: 1,
        page_size: 100
      });

      console.log('获取债券列表响应', response);
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

  // 获取债券购买记录列表
  const getList = useCallback(async () => {
    // 准备请求参数
    const params: any = {
      created_at_end: filters.state.created_at_end,
      created_at_start: filters.state.created_at_start,
      member_address: filters.state.address,
      member_code: filters.state.member_code, // 会员编码
      page: pagination.page,
      page_size: pagination.pageSize,
      only_member: filters.state.only_member, // 是否查询单个用户
      bond_id: filters.state.bond_id, // 债券ID
      purchase_method: filters.state.purchase_method, // 购买方式
    };

    console.log('params', params);
   
    setUsersLoading(true);
    await getMemberPerformanceBondPurchase(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code, message } = apiResult;
        if (code === 0) {
          // 如果为空，需要设置默认值
          setFilteredData((data?.list as IBondPurchaseItem[])?.map(item => {
            return {
              ...item,
              id: item.hash || Math.random().toString(36).substring(2, 15) // 使用hash作为id，如果没有则生成随机id
            }
          }) || []);
          setTotalCount(data?.total || 0);
          
          // 保存债券购买统计数据
          if (data?.statistics_amount) {
            setBondStats({
              usdt_amount: data.statistics_amount.usdt_amount || '0',
              expected_ksp_amount: data.statistics_amount.expected_ksp_amount || '0',
              calc_ksp_amount: data.statistics_amount.calc_ksp_amount || '0',
            });
          }
        } else {
          console.error('获取债券购买记录失败:', message);
          toast.error(message);
          setFilteredData([]);
          setTotalCount(0);
        }
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, [
    pagination.page,
    pagination.pageSize,
    filters.state,
  ]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据

  // 获取债券列表数据
  useEffect(() => {
    fetchBondData();
  }, []);

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

  // 处理单个用户查询复选框状态变化
  const handleOnlyMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filtersForEdit.setState({
      only_member: event.target.checked,
    });
  };

  const handleFilterMemberCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('会员编码', event.target.value);
    filtersForEdit.setState({
      member_code: event.target.value,
    });
  };

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    // 获取时间参数
    filters.setState({
      address: filtersForEdit.state.address,
      remark: filtersForEdit.state.remark,
      id: filtersForEdit.state.id || undefined,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.unix(),
      last_login_ip: filtersForEdit.state.last_login_ip,
      type: filtersForEdit.state.type,
      only_member: filtersForEdit.state.only_member,
      member_code: filtersForEdit.state.member_code, // 同步会员编码
      bond_id: filtersForEdit.state.bond_id, // 同步债券ID
      purchase_method: filtersForEdit.state.purchase_method as 0 | 1 | 2, // 同步购买方式
    });
    
    console.log('点击查询按钮, 会员编码:', filtersForEdit.state.member_code);
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
    [filtersForEdit]
  );

  const handleFilterBondID = useCallback(
    (event: SelectChangeEvent<string | number>) => {
      const value = event.target.value;
      // If value is empty string, set to undefined, otherwise convert to number
      filtersForEdit.setState({ bond_id: value === '' ? undefined : Number(value) });
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
        bonds={bonds}
      />
    ),
    [
      canReset,
      memoizedFiltersForEdit,
      selectedRowIds,
      filteredData,
      setFilterButtonEl,
      bonds,
    ]
  );

  const columns: GridColDef[] = [
    {
      field: 'purchase_at',
      headerName: '购买时间',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        // 将Unix时间戳（秒）转换为人类可读的日期格式
        const timestamp = params.row.purchase_at;
        const date = new Date(timestamp * 1000); // 转换为毫秒
        const formattedDate = date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        return <CellWithTooltipCopy value={formattedDate} />;
      },
    },
    {
      field: 'hash',
      headerName: '交易hash',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.hash} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'member_code',
      headerName: '用户编码',
      minWidth: 210,
      flex: 1,
      // 展示前后五位
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.member_code} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'member_address',
      headerName: '用户地址',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.member_address} props={{ displayLength: 16 }} />
      ),
    },

    {
      field: 'purchase_amount',
      headerName: 'USDT数量',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.purchase_amount?.toString()} />
      ),
    },
    {
      field: 'price',
      headerName: '原始价格',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.price?.toString()} />
      ),
    },
    {
      field: 'discount_price',
      headerName: '折扣价格',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.discount_price?.toString()} />
      ),
    },
    {
      field: 'calc_amount',
      headerName: '计算数量(KSN)',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.calc_amount?.toString()} />
      ),
    },
    {
      field: 'expected_amount',
      headerName: '应得数量(KSN)',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.expected_amount?.toString()} />
      ),
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
          heading="社区债券购买记录"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
            { name: '社区债券购买记录' },
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
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.address}
                onChange={handleFilterAddress}
                placeholder="请输入社区地址"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl>

            {/* 债券选择下拉框 */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <FormControl fullWidth>
                <InputLabel id="bond-select-label">债券</InputLabel>
                <Select
                  labelId="bond-select-label"
                  value={filtersForEdit.state.bond_id !== undefined ? filtersForEdit.state.bond_id : ''}
                  onChange={handleFilterBondID}
                  label="债券"
                >
                  {bonds.map((bond) => (
                    <MenuItem key={bond.id} value={bond.id}>
                      {bond.name} - {bond.type_string} ({bond.id})
                    </MenuItem>
                  ))}
                  <MenuItem
                    value=""
                    sx={{
                      justifyContent: 'center',
                      fontWeight: (theme) => theme.typography.fontWeightBold,
                      border: (theme) =>
                        `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
                      bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                    }}
                  >
                    清除
                  </MenuItem>
                </Select>
              </FormControl>
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

            {/* 会员编码输入框 */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.member_code}
                onChange={handleFilterMemberCode}
                placeholder="请输入会员编码"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:person-fill" sx={{ color: 'text.disabled' }} />
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

            {/* 单个用户查询复选框 */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={filtersForEdit.state.only_member}
                    onChange={handleOnlyMemberChange}
                    name="only_member"
                  />
                }
                label="仅查询单个用户"
              />
            </FormControl>

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>

          {/* 债券购买统计数据 - 卡片形式 */}
          <Box sx={{ px: 2, py: 2 }}>
            <Stack direction="row" spacing={3} divider={<Box sx={{ height: '60px', borderLeft: 1, borderColor: 'divider' }} />}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">总购买金额 (USDT)</Typography>
                <Typography variant="h6">{Number(bondStats.usdt_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">预期 KSN 数量</Typography>
                <Typography variant="h6">{Number(bondStats.expected_ksp_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">计算 KSN 数量</Typography>
                <Typography variant="h6">{Number(bondStats.calc_ksp_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* 数据表格，采用服务端管理数据模式 */}
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={filteredData}
            columns={columns}
            loading={usersLoading}
            
            pageSizeOptions={[10, 20, 50, 100]}
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
              '& .sticky-column': {
                position: 'sticky !important',
                right: 0,
                backgroundColor: () => theme.palette.background.paper,
                zIndex: 1,
                borderRight: () => `1px solid ${theme.palette.divider}`,
                isolation: 'isolate',
              },
            }}
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
        <UserTableFiltersResult filters={filtersForEdit} totalResults={0} sx={{ p: 2.5, pt: 0 }} />
      )}
    </>
  );
}

// ----------------------------------------------------------------------
