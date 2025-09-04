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
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
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

import { round } from 'lodash-es';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IconButton, MenuItem, Checkbox, FormControlLabel, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { ConfirmDialog } from 'src/components/custom-dialog';

import { toast } from 'src/components/snackbar';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';

import {
  getMemberPerformanceBondWithSwap,

} from 'src/api/user';

import { getBondIndexAPI, BondData } from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import { RemarkForm } from '../remark-form';
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
export function UserListView() {
  const popover = usePopover();

  const [bonds, setBonds] = useState<BondData[]>([]);

  // 获取债券列表数据
  const fetchBondData = async () => {
    try {
      const response = await getBondIndexAPI({});

      console.log('response获取债券列表', response);
      if (response.data) {
        const bondDataResult = response.data.list;
        setBonds(bondDataResult);
      }
    } catch (error) {
      console.error('获取债券列表失败:', error);
      toast.error('获取债券列表失败!');
    }
  };

  // // 组件加载时获取数据
  // useEffect(() => {
  //   fetchBondData();
  // }, []);

  // 通过ID查询债券名称：bonds
  const getBondNameById = (id: number) => {
    const bond = bonds.find((item) => item.id === id);
    return bond?.name || '';
  };
  const [remark, setRemark] = useState('');

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
    only_billing_date: false,
    trans_type: undefined, // 交易类型：'send'(出金) 或 'receive'(入金)
    only_member: false, // 查询单个用户（运营中心/社区：false；单个用户：true）
    member_code: '', // 用户编码
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
    only_billing_date?: boolean;
    trans_type: 'send' | 'receive' | '';
    only_member?: boolean;
    member_code?: string; // 用户编码
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
    trans_type: '',
    only_billing_date: false,
    only_member: false,
    member_code: '',
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<IUserItemforlist[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<IUserItemforlist[]>([]);
  // 总计
  const [totalCount, setTotalCount] = useState<number>(0);
  // 总入金和总出金统计
  const [swapStats, setSwapStats] = useState<{
    send_amount: {
      ksp_token_amount: string;
      usdt_token_amount: string;
    };
    receive_amount: {
      ksp_token_amount: string;
      usdt_token_amount: string;
    };
  }>({    
    send_amount: {
      ksp_token_amount: '0',
      usdt_token_amount: '0',
    },
    receive_amount: {
      ksp_token_amount: '0',
      usdt_token_amount: '0',
    }
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



  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.address || !!filtersForEdit.state.id || !!filtersForEdit.state.remark;

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );
 

  // 获取用户列表
  const getList = useCallback(async () => {
    // 准备请求参数
    const params: any = {
      created_at_end:filters.state.created_at_end,
      created_at_start:filters.state.created_at_start,
      member_address:filters.state.address,
      member_code:filters.state.member_code, // 会员编码
      page: pagination.page,
      page_size: pagination.pageSize,
      only_member: filters.state.only_member, // 是否查询单个用户
    };
    
    // 只有当trans_type有具体值时才添加到参数中
    if (filters.state.trans_type) {
      params.trans_type = filters.state.trans_type;
    }

    console.log('params', params);

   
    setUsersLoading(true);
    await getMemberPerformanceBondWithSwap(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code, message } = apiResult;
        if (code === 0) {
          // 如果为空，需要设置默认值
          setFilteredData((data?.list as IUserItemforlist[])?.map(item => {
            return {
              ...item,
              // @ts-ignore
              id: item.member_id // 使用tx_hash作为id
            }
          }) || []);
          setTotalCount(data?.total || 0);
          
          // 保存总入金和总出金统计数据
          if (data?.send_amount && data?.receive_amount) {
            setSwapStats({
              send_amount: {
                ksp_token_amount: data.send_amount.ksp_token_amount || '0',
                usdt_token_amount: data.send_amount.usdt_token_amount || '0',
              },
              receive_amount: {
                ksp_token_amount: data.receive_amount.ksp_token_amount || '0',
                usdt_token_amount: data.receive_amount.usdt_token_amount || '0',
              }
            });
          }
        } else {
          toast.error(message)
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

  // 处理账单日筛选变更
  const handleBillingDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filtersForEdit.setState({
      only_billing_date: event.target.checked,
    });
  };

  // 处理交易类型选择变更
  const handleTransTypeChange = (event: SelectChangeEvent) => {
    filtersForEdit.setState({
      trans_type: event.target.value as '' | 'send' | 'receive',
    });
  };

  // 处理单个用户查询复选框状态变化
  const handleOnlyMemberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    filtersForEdit.setState({
      only_member: event.target.checked,
    });
  };
  
  // 处理会员编码输入变化
  const handleFilterMemberCode = (event: React.ChangeEvent<HTMLInputElement>) => {
    filtersForEdit.setState({
      member_code: event.target.value,
    });
    console.log('会员编码输入:', event.target.value);
  };

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    // 获取时间参数，
    filters.setState({
      address: filtersForEdit.state.address,
      remark: filtersForEdit.state.remark,
      id: filtersForEdit.state.id || undefined,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.unix(),
      last_login_ip: filtersForEdit.state.last_login_ip,
      type: filtersForEdit.state.type,
      only_billing_date: filtersForEdit.state.only_billing_date,
      // 如果是空字符串，则转为undefined
      trans_type: filtersForEdit.state.trans_type === '' ? undefined : filtersForEdit.state.trans_type,
      only_member: filtersForEdit.state.only_member,
      member_code: filtersForEdit.state.member_code, // 添加会员编码
    });
  };

  // 会员类型映射
  const memberTypeMap = {
    1: '默认',
    2: '运营中心',
    3: '社区',
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

  const handleFilterRemark = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ remark: event.target.value });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const handleFilterType = useCallback(
    (event: SelectChangeEvent<number>) => {
      if(event.target.value === '') {
        filtersForEdit.setState({ type: undefined });
        return;
      }
      filtersForEdit.setState({ type: Number(event.target.value) as 1 | 2 | 3  });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const handleFilterID = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ id: Number(event.target.value) || undefined });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
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



  // updateUserTypeAPI

  const handleParentAddressClick = (address: string) => {
    console.log('点击了用户地址', address);
    filtersForEdit.setState({
      address,
      id: filtersForEdit.state.id || undefined,
      created_at_start: null,
      created_at_end: null,
    });

    // 重置分页
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
    // 获取时间参数，

    filters.setState({
      address,
      remark: filtersForEdit.state.remark,
      id: filtersForEdit.state.id || undefined,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.unix(),
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'member_code',
      headerName: '用户编号',
      minWidth: 150,
      flex: 1,
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
      field: 'member_id',
      headerName: '用户ID',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.member_id} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'type_string',
      headerName: '用户类型',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.type_string || '-'} />
      ),
    },
    {
      field: 'son_member_count',
      headerName: '子用户数量',
      minWidth: 120,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.son_member_count} />
      ),
    },
    {
      field: 'bond_usdt',
      headerName: '债券USDT购买数量',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.bond_usdt || '0'} />
      ),
    },
    {
      field: 'bond_ksp',
      headerName: '债券KSN购买数量',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.bond_ksp || '0'} />
      ),
    },
    {
      field: 'swap_send_usdt',
      headerName: 'USDT出金数量',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.swap_send_usdt || '0'} />
      ),
    },
    {
      field: 'swap_send_ksp',
      headerName: 'KSN出金数量',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.swap_send_ksp || '0'} />
      ),
    },
    {
      field: 'swap_receive_usdt',
      headerName: 'USDT入金数量',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.swap_receive_usdt || '0'} />
      ),
    },
    {
      field: 'swap_receive_ksp',
      headerName: 'KSN入金数量',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.swap_receive_ksp || '0'} />
      ),
    },
    {
      field: 'total_receive_usdt',
      headerName: 'USDT总入金',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.total_receive_usdt || '0'} />
      ),
    },
    {
      field: 'total_receive_ksp',
      headerName: 'KSN总入金',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.total_receive_ksp || '0'} />
      ),
    },
    {
      field: 'remark',
      headerName: '备注',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.remark || '-'} />
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
          heading="社区出入金汇总"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
            { name: '社区出入金汇总' },
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

            {/* <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.remark}
                onChange={handleFilterRemark}
                placeholder="请输入备注"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl> */}


            {/* 会员类型 */}
            {/* <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Select
                value={filtersForEdit.state.type || ""}
                onChange={handleFilterType}
                displayEmpty
                renderValue={(selected) => {
                  if (!selected) {
                    return '请选择会员类型';
                  }
                  // Properly cast to a specific literal type (1|2|3) that exists as keys in memberTypeMap
                  return memberTypeMap[selected as 1 | 2 | 3];
                }}
              >
                <MenuItem value="">
                  <em>请选择会员类型</em>
                </MenuItem>
                <MenuItem value={1}>{memberTypeMap[1]}</MenuItem>
                <MenuItem value={2}>{memberTypeMap[2]}</MenuItem>
                <MenuItem value={3}>{memberTypeMap[3]}</MenuItem>
              </Select>
            </FormControl> */}
            {/* <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.id}
                onChange={handleFilterID}
                placeholder="请输入id"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </FormControl> */}

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

            {/* 交易类型选择 */}
            {/* <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Select
                value={filtersForEdit.state.trans_type}
                onChange={handleTransTypeChange}
                displayEmpty
                size="small"
                renderValue={(selected) => {
                  // @ts-ignore
                  if (selected === "") {
                    return '交易类型(全部)';
                  }
                  return selected === 'send' ? '出金' : '入金';
                }}
              >
                <MenuItem value="">
                  <em>全部</em>
                </MenuItem>
                <MenuItem value="send">出金</MenuItem>
                <MenuItem value="receive">入金</MenuItem>
              </Select>
            </FormControl> */}

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

          {/* 总入金和总出金统计数据 */}
          {/* <Box sx={{  px:2 }}>
              <Stack direction="row" spacing={3} divider={<Box sx={{ height: '60px', borderLeft: 1, borderColor: 'divider' }} />}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">总出金 (USDT)</Typography>
                  <Typography variant="h6">{Number(swapStats.send_amount.usdt_token_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">总出金 (KSN)</Typography>
                  <Typography variant="h6">{Number(swapStats.send_amount.ksp_token_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">总入金 (USDT)</Typography>
                  <Typography variant="h6">{Number(swapStats.receive_amount.usdt_token_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">总入金 (KSN)</Typography>
                  <Typography variant="h6">{Number(swapStats.receive_amount.ksp_token_amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}</Typography>
                </Stack>
              </Stack>
          </Box> */}

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
