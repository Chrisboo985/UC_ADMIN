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

import type { IDatePickerControl } from 'src/types/common';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';
import type { IUserItemforlist, IUserTableFiltersForList } from 'src/types/user';
import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import dayjs from 'dayjs'
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog'
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Checkbox, IconButton, MenuItem, Switch, Typography } from '@mui/material';
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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { fNumberWithSeparator } from 'src/utils/format-number';
import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import {
  getMemberIndexAPI,
  setMemberTypeAPI,
  resetPasswordAPI,
  type ResetPasswordRequest,
  updateMemberAddressAPI,
  updateUserStatusAPI,
  type UpdateUserStatusRequest,
  updateMemberNetStatusAPI,
  type UpdateMemberNetStatusRequest,
  updateMemberAddressStatusAPI,
  type UpdateMemberAddressStatusRequest,
  updateMemberWithdrawStatusAPI,
  type UpdateMemberWithdrawStatusRequest,
  confrimNodeSubscriptionAPI,
  type ConfirmNodeSubscriptionRequest,
  getMemberListAPI,
  type getMemberListAPIResponse,
  UserType,
  getMemberListReqeust,
  setUserTypeAPI,
  setLine0UserType,
  setVirtualZoneOpenStatus,
  updateRemark
} from 'src/api/user';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form'
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AddressForm } from '../address-form';
import { SetLevelForm } from '../set-level-form';
import { CapitalFlowForm } from '../capital-flow-form';
import { CellWithTooltipCopy } from '../user-table-cell';
import { type UserTypeItem } from './user-list-view.types'
import { ResetPasswordForm } from '../reset-password-form';
import { AddressModifyForm } from '../address-modify-form';
import { ChangeSuperiorForm } from '../change-superior-form';
import { UserTableFiltersResult } from '../user-table-filters-result';

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

export const ResetPasswordSchema = zod.object({
  remark: zod.string(),
});

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

type Row = getMemberListAPIResponse['list'][number]

const userTypeItems: UserTypeItem[] = [
  { label: '全部', value: UserType.All },
  // { label: '普通用户', value: UserType.Normal },
  { label: '社区用户', value: UserType.Community },
]

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function UserListView(props: { h: boolean }) {
  const { h: advancedUserListPage } = props;

  const theme = useTheme();

  const confirm = useBoolean();
  const openDateRange = useBoolean();

  const filters = useSetState<getMemberListReqeust>({
    address: '',
    type: UserType.All,
    created_at_start: null,
    created_at_end: null,
  });

  const filtersForEdit = useSetState<{
    address?: string;
    created_at_end?: number;
    created_at_start?: number;
    h_username?: string;
    member_code?: string;
    is_business?: boolean;
    parent_code?: string;
    type: UserType;
  }>({
    address: '',
    created_at_end: undefined,
    created_at_start: undefined,
    h_username: '',
    member_code: '',
    is_business: undefined,
    parent_code: undefined,
    type: UserType.All,
  });

  // 过滤数据
  const [filteredData, setFilteredData] = useState<Row[]>([]);
  // 总计
  const [totalCount, setTotalCount] = useState<number>(0);
  // 当前选中ID
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  // 筛选按钮元素
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  // 列显示模式
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  // 分页
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const [usersLoading, setUsersLoading] = useState<true | false>(false);

  // 用户状态切换相关状态
  const [selectedUser, setSelectedUser] = useState<IUserItemforlist | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  // 更绑地址相关状态
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [currentUserForAddress, setCurrentUserForAddress] = useState<IUserItemforlist | null>(null);

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.address || !!filtersForEdit.state.h_username || !!filtersForEdit.state.member_code || !!filtersForEdit.state.is_business || !!filtersForEdit.state.parent_code || !!filtersForEdit.state.created_at_start || !!filtersForEdit.state.created_at_end;

  // 获取用户列表
  const getList = useCallback(async () => {
    const params: any = {
      address: filters.state.address,
      type: filters.state.type,
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    if (
      filters.state.created_at_start != null &&
      filters.state.created_at_end != null
    ) {
      params.created_at_start = filters.state.created_at_start;
      params.created_at_end = filters.state.created_at_end;
    }

    if (params.type === UserType.All) params.type = '' as any;

    console.log('params', params);

    setUsersLoading(true);
    await getMemberListAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          // 如果为空，需要设置默认值
          setFilteredData(data?.list || []);
          setTotalCount(data?.total || 0);
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

  ]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据

  // 服务端控制 条件筛选
  const handleFilterData = () => {

    // 只保留接口支持的搜索参数
    filters.setState({
      address: filtersForEdit.state.address,
      type: filtersForEdit.state.type,
      created_at_start: (filtersForEdit.state.created_at_start ?? null) as any,
      created_at_end: (filtersForEdit.state.created_at_end ?? null) as any,
    });
  };


  const handleParentAddressClick = useCallback(async (address: string) => {
    // 同步编辑态与请求态，并触发请求
    filtersForEdit.setState({ address });
    filters.setState({ address });
    toast.info(`已筛选地址: ${address}`);
  }, [filtersForEdit.setState, filters.setState]);

  // 移除自动应用，改为在显式操作处同步请求态，避免重复请求

  // 会员类型选择对话框状态
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<1 | 2 | 3>(1);

  // 关闭更绑地址弹框
  const handleCloseAddressDialog = useCallback(() => {
    setOpenAddressDialog(false);
    setCurrentUserForAddress(null);
  }, []);
  // 提交更绑地址
  const handleSubmitAddress = useCallback(async (data: { member_id: number; type: UserType; }) => {
    const _data = data

    // @ts-ignore
    if (_data.type === UserType.All) _data.type = ''
    const toastId = toast.loading('正在修改用户类型...');
    try {
      const response = await setUserTypeAPI(_data);
      if (response.code === 0) {
        toast.success('修改用户类型成功');
        handleCloseAddressDialog();
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '修改用户类型失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      toast.dismiss(toastId);
    }
  }, [getList, handleCloseAddressDialog]);
  // 关闭重置密码弹窗

  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [newUserStatus, setNewUserStatus] = useState<UserType.Community | UserType.Line0 | undefined>(undefined)

  // 处理用户状态切换确认
  const handleConfirmStatusChange = useCallback(async () => {
    setOpenStatusDialog(false)
    const toastId = toast.loading('正在设置中...');
    try {
      const response = await (
        newUserStatus === UserType.Community ?
          setUserTypeAPI({ member_id: userId!, type: UserType.Community }) :
          setLine0UserType({ member_id: userId! })
      )

      if (response.code !== 0) return toast.error(response.message || '设置失败')
      toast.success('设置成功');

      getList();
    } catch (error) {
      console.error('设置失败:', error);
      toast.error('设置失败', { id: toastId });
    } finally {
      setUserId(undefined)
      setNewUserStatus(undefined)
      toast.dismiss(toastId)
    }
  }, [newUserStatus, getList]);


  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const handleApply = (start: IDatePickerControl, end: IDatePickerControl) => {
    // 更新编辑态
    const startUnix = start?.unix();
    const endUnix = end?.unix();

    // 如果是清空（传入 null），同步清空请求态为 null
    if (!start && !end) {
      filtersForEdit.setState({ created_at_start: undefined, created_at_end: undefined });
      filters.setState({ created_at_start: null, created_at_end: null });
      return;
    }

    // 正常选择范围，同步到编辑态与请求态
    filtersForEdit.setState({
      created_at_start: startUnix || undefined,
      created_at_end: endUnix || undefined,
    });
    filters.setState({
      created_at_start: (startUnix ?? null) as any,
      created_at_end: (endUnix ?? null) as any,
    });
  };

  const handleClearDateRange = React.useCallback(() => {
    filtersForEdit.setState({ created_at_start: undefined, created_at_end: undefined });
    filters.setState({ created_at_start: null, created_at_end: null });
  }, [filtersForEdit.setState, filters.setState]);

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
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

  const handleUserTypeChange = React.useCallback(
    (type: UserType.Community | UserType.Line0, row: Row) => {
      setUserId(row.id)
      setNewUserStatus(type)
      setOpenStatusDialog(true)
    },
    []
  )

  const [row, setRow] = React.useState<Row | null>(null)
  const [openStatusDialog2, setOpenStatusDialog2] = React.useState(false)

  const handleVirtualZoneOpenStatusChange = React.useCallback(
    (row: Row) => {
      setRow(row)
      setOpenStatusDialog2(true)
    },
    []
  )

  const handleConfirmStatusChange2 = React.useCallback(
    async () => {
      setOpenStatusDialog2(false)
      const toastId = toast.loading('正在设置中...');
      try {
        const { id, open_virtual_region } = row!
        const response = await setVirtualZoneOpenStatus({ member_id: id, open_virtual_region: !open_virtual_region })

        if (response.code !== 0) return toast.error(response.message || '设置失败')
        toast.success('设置成功');
        getList();
      } catch (error) {
        console.log(error)
        console.error('设置失败:', error);
        toast.error('设置失败', { id: toastId });
      } finally {
        setRow(null)
        toast.dismiss(toastId)
      }
    },
    [row]
  )

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const handleUserTypeFilter = React.useCallback(
    (type: UserType) => {
      filtersForEdit.setState({ type });
    },
    [filtersForEdit]
  )

  const [updateRemarksVisible, setUpdateRemarksVisible] = React.useState(false)
  const [currentActionRow, setCurrentActionRow] = React.useState<Row | null>(null)
  const defaultValues = {
    remark: '',
  };

  const methods = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues,
  });

  const handleUpdateRemarks = React.useCallback(
    (row: Row) => {
      setCurrentActionRow(row)
      setUpdateRemarksVisible(true)
      methods.setValue('remark', row.remark || '')
    },
    []
  )

  const columns: GridColDef[] = [
    {
      field: 'address',
      headerName: '地址 ',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: '$parentMemberAddress',
      headerName: '上级地址',
      minWidth: 190,
      renderCell: (params) => {
        const value = params.row.parent_member?.address;
        if (!value) return <CellWithTooltipCopy value="-" />;

        return (
          <Box
            onClick={() => handleParentAddressClick(value)}
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted',
              '&:hover': {
                color: 'primary.dark',
                backgroundColor: 'action.hover',
                borderRadius: 1,
                px: 0.5,
              },
            }}
          >
            <CellWithTooltipCopy
              value={value}
              props={{ displayLength: 16 }}
            />
          </Box>
        );
      },
      valueFormatter: (value, row) => row.parent_member?.address,
    },
    {
      field: 'dynamic_reward',
      headerName: '动态奖',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'static_reward',
      headerName: 'nft 静态奖励',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'level_up_reward',
      headerName: '晋级奖励',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'receive_reward_usdt',
      headerName: '已领取奖励usdt价值',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'receive_reward',
      headerName: '已领取奖励',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'withdraw_limit',
      headerName: '提现额度',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'level',
      headerName: '等级',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: 'type',
      headerName: '用户类型',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={userTypeItems.find(item => item.value === value)?.label || '-'} />,
      valueFormatter: (value) => userTypeItems.find(item => item.value === value)?.label
    },
    {
      field: 'community_usdt_recharge_amount',
      headerName: '社区usdt充值业绩',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />
    },
    {
      field: '$communityAtString',
      headerName: '社区成立时间',
      minWidth: 190,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.community_at ? params.row.community_at_string : '-'} />,
      valueFormatter: (value, row) => row.community_at ? row.community_at_string : ''
    },
    {
      field: 'top_member_at',
      headerName: '0号线成立时间',
      minWidth: 190,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value ? dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss') : '-'} />,
      valueFormatter: (value) => value ? dayjs.unix(value).format('YYYY-MM-DD HH:mm:ss') : ''
    },
    {
      field: 'power',
      headerName: '算力',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'team_power',
      headerName: '团队算力',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'order_count',
      headerName: '节点认购数量',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'usdt_recharge_amount',
      headerName: 'USDT充值数量',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'network_order_count',
      headerName: '团队节点认购数量',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'order_reward',
      headerName: '认购奖励',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'team_usdt_recharge_amount',
      headerName: '团队USDT充值数量',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'ip',
      headerName: 'IP地址',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'remark',
      headerName: '备注',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={value || '-'} />,
    },
    {
      field: 'open_virtual_region',
      headerName: '是否虚拟大区',
      minWidth: 120,
      valueFormatter: (value) => value ? '是' : '否'
    },
    {
      field: '$setCommunityUser',
      headerName: '设为社区用户 ',
      minWidth: 120,
      renderCell: (params) => (
        <Switch
          disabled={params.row.type === UserType.Community}
          checked={params.row.type === UserType.Community}
          onChange={() => handleUserTypeChange(UserType.Community, params.row)}
        />
      ),
      valueFormatter: (value, row) => row.type === UserType.Community ? '是' : '否',
    },
    {
      field: '$setLine0User',
      headerName: '设为0号线用户 ',
      minWidth: 120,
      renderCell: (params) => (
        <Switch
          disabled={params.row.is_top_member}
          checked={params.row.is_top_member}
          onChange={() => handleUserTypeChange(UserType.Line0, params.row)}
        />
      ),
      valueFormatter: (value, row) => row.is_top_member ? '是' : '否',
    },
    {
      type: 'actions',
      field: 'actions',
      pinnable: true,
      headerName: '操作',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      // Fixed column
      headerClassName: 'sticky-column',
      cellClassName: 'sticky-column',
      getActions: (params) => [
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:currency-usd" />}
        //   label="设置用户类型"
        //   onClick={() => setUserType(params.row)}
        //   disabled={false}
        // />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="mdi:currency-usd" />}
          label="更新会员备注"
          onClick={() => handleUpdateRemarks(params.row)}
          disabled={false}
        />,
      ],
    },
  ];

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading('正在更新会员备注...')

    try {
      const { code, message } = await updateRemark({ id: currentActionRow!.id, remark: data.remark })

      if (code !== 0) return toast.error(message || '更新会员备注失败')

      toast.success('更新会员备注成功')
      getList()
    } catch (error) {
      console.error(error);
    } finally {
      toast.dismiss(toastId)
      setUpdateRemarksVisible(false)
    }
  })

  const onClose = React.useCallback(
    () => {
      console.log('关闭成功')
    },
    []
  )

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="会员列表"
          links={[
            {
              name: '管理',
              // href: paths.dashboard.root
            },
            {
              name: '会员',
              // href: paths.dashboard.user.root
            },
            { name: '会员列表' },
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
                placeholder="请输入用户地址"
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
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={filtersForEdit.state.type}
                label="Age"
                onChange={(e) => handleUserTypeFilter(e.target.value as UserType)}
              >
                {
                  userTypeItems.map(({ label, value }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
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
                {
                  !!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end ?
                    `${ dayjs.unix(filtersForEdit.state.created_at_start).format('YYYY-MM-DD HH:mm') } - ${ dayjs.unix(filtersForEdit.state.created_at_end).format('YYYY-MM-DD HH:mm') }` :
                    '选择时间范围'
                }
              </Button>
              <CustomDateRangePicker
                variant="input"
                startDate={ filtersForEdit.state.created_at_start ? dayjs.unix(filtersForEdit.state.created_at_start) : null}
                endDate={ filtersForEdit.state.created_at_end ? dayjs.unix(filtersForEdit.state.created_at_end) : null }
                open={openDateRange.value}
                onClose={openDateRange.onFalse}
                onApply={handleApply}
                selected={
                  !!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end
                }
                error={dateError}
              />
            </FormControl>
            {!!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end && (
              <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 120 } }}>
                <Button color="inherit" onClick={handleClearDateRange}>清空时间</Button>
              </FormControl>
            )}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>
          <Box sx={{ px: 2, py: 2 }}>
            <Stack direction="row" spacing={3} divider={<Box sx={{ height: '60px', borderLeft: 1, borderColor: 'divider' }} />}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">总会员数</Typography>
                <Typography variant="h6">{fNumberWithSeparator(totalCount, 0)}</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* 数据表格，采用服务端管理数据模式 */}
          <DataGrid
            checkboxSelection={false}
            disableRowSelectionOnClick
            disableColumnSorting
            rows={filteredData}
            columns={columns.filter((column) => {
              if (column.field === 'last_login_ip') {
                return advancedUserListPage;
              }
              return true;
            })}
            loading={usersLoading}
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
              // 排序功能已移除，新接口不支持排序参数
              console.log('排序功能已移除，新接口不支持排序参数', model);
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

      {/* 设置用户类型弹窗 */}
      {currentUserForAddress && (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={openAddressDialog}
          onClose={handleCloseAddressDialog}
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
          <AddressForm
            items={userTypeItems}
            currentUser={currentUserForAddress}
            open={openAddressDialog}
            onClose={handleCloseAddressDialog}
            onSubmitSuccess={handleSubmitAddress}
          />
        </Dialog>
      )}

      <ConfirmDialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        title="确认状态变更"
        content={
          newUserStatus === UserType.Community ?
            '确定要设为社区用户吗？' :
            '0号线账号，将自动升级为社区，是否确认将用户设置为0号线账号？'
        }
        action={
          <Button
            variant="contained"
            color='error'
            onClick={handleConfirmStatusChange}
          >
            确认
          </Button>
        }
      />

      <ConfirmDialog
        open={openStatusDialog2}
        onClose={() => setOpenStatusDialog2(false)}
        title="确认状态变更"
        content={`是否确定要${row?.open_virtual_region ? '关闭' : '开启'}虚拟大区`}
        action={
          <Button
            variant="contained"
            color='error'
            onClick={handleConfirmStatusChange2}
          >
            确认
          </Button>
        }
      />

      <Dialog
        fullWidth
        maxWidth="xs"
        open={updateRemarksVisible}
        onClose={onClose}
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

        <DialogTitle sx={{ minHeight: 60, }}>
          更新会员备注
        </DialogTitle>

        <DialogContent sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', minHeight: 100 }}>
          <Form methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2} sx={{ flex: 1 }} style={{ marginTop: '10px' }}>
              <Field.Text
                autoFocus
                name="remark"
                label="会员备注"
                placeholder="请输入您需要更新的会员备注"
                InputLabelProps={{ shrink: true }}
                multiline
              />
            </Stack>

            <DialogActions sx={{ px: 0, pb: 2, mt: 'auto' }}>
              <Button variant="outlined" onClick={() => setUpdateRemarksVisible(false)}>
                取消
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
              >
                确认
              </LoadingButton>
            </DialogActions>
          </Form>
        </DialogContent>

      </Dialog>
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
