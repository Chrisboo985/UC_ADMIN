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

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { IconButton, MenuItem, Switch } from '@mui/material';

import { paths } from 'src/routes/paths';

import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Label } from 'src/components/label';

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
  type ConfirmNodeSubscriptionRequest
} from 'src/api/user';
import { ResetPasswordForm } from '../reset-password-form';
import { AddressModifyForm } from '../address-modify-form';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import { AddressForm } from '../address-form';
import { CapitalFlowForm } from '../capital-flow-form';
import { ChangeSuperiorForm } from '../change-superior-form';
import { SetLevelForm } from '../set-level-form';
// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function UserListView(props: { h: boolean }) {
  const { h: advancedUserListPage } = props;

  const theme = useTheme();

  const confirm = useBoolean();

  const filters = useSetState<IUserTableFiltersForList>({
    address: '',
    created_at_end: undefined,
    created_at_start: undefined,
    h_username: '',
    member_code: '',
    is_business: undefined,
    parent_code: undefined,
  });

  const filtersForEdit = useSetState<{
    address?: string;
    created_at_end?: number;
    created_at_start?: number;
    h_username?: string;
    member_code?: string;
    is_business?: boolean;
    parent_code?: string;
  }>({
    address: '',
    created_at_end: undefined,
    created_at_start: undefined,
    h_username: '',
    member_code: '',
    is_business: undefined,
    parent_code: undefined,
  });

  // 过滤数据
  const [filteredData, setFilteredData] = useState<IUserItemforlist[]>([]);
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

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // 用户状态切换相关状态
  const [selectedUser, setSelectedUser] = useState<IUserItemforlist | null>(null);
  const [newUserStatus, setNewUserStatus] = useState<'normal' | 'blocked'>('normal');
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  // 用户地址状态切换相关状态
  const [selectedUserForAddressStatus, setSelectedUserForAddressStatus] = useState<IUserItemforlist | null>(null);
  const [newAddressStatus, setNewAddressStatus] = useState<'normal' | 'blocked'>('normal');
  const [openAddressStatusDialog, setOpenAddressStatusDialog] = useState(false);

  // 用户提现状态切换相关状态
  const [selectedUserForWithdrawStatus, setSelectedUserForWithdrawStatus] = useState<IUserItemforlist | null>(null);
  const [newWithdrawStatus, setNewWithdrawStatus] = useState<'normal' | 'blocked'>('normal');
  const [openWithdrawStatusDialog, setOpenWithdrawStatusDialog] = useState(false);

  // 重置密码相关状态
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [currentUserForResetPassword, setCurrentUserForResetPassword] = useState<IUserItemforlist | null>(null);

  // 更绑地址相关状态
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [currentUserForAddress, setCurrentUserForAddress] = useState<IUserItemforlist | null>(null);

  // 资金流水相关状态
  const [openCapitalFlowDialog, setOpenCapitalFlowDialog] = useState(false);
  const [currentUserForCapitalFlow, setCurrentUserForCapitalFlow] = useState<IUserItemforlist | null>(null);

  const [currentUserForCapitalFlowType, setCurrentUserForCapitalFlowType] = useState<any>(null);

  // 更改上级相关状态
  const [openChangeSuperiorDialog, setOpenChangeSuperiorDialog] = useState(false);
  const [currentUserForChangeSuperior, setCurrentUserForChangeSuperior] = useState<IUserItemforlist | null>(null);

  // 设置等级相关状态
  const [openSetLevelDialog, setOpenSetLevelDialog] = useState(false);
  const [currentUserForSetLevel, setCurrentUserForSetLevel] = useState<IUserItemforlist | null>(null);

  // 批量封禁相关状态
  const [openBatchBanDialog, setOpenBatchBanDialog] = useState(false);
  const [currentUserForBatchBan, setCurrentUserForBatchBan] = useState<IUserItemforlist | null>(null);
  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.address || !!filtersForEdit.state.h_username || !!filtersForEdit.state.member_code || !!filtersForEdit.state.is_business || !!filtersForEdit.state.parent_code || !!filtersForEdit.state.created_at_start || !!filtersForEdit.state.created_at_end;

  // 获取用户列表
  const getList = useCallback(async () => {
    const params = {
      ...filters.state,

      page: pagination.page,
      page_size: pagination.pageSize,
    };

    console.log('params', params);

    setUsersLoading(true);
    await getMemberIndexAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          // 如果为空，需要设置默认值
          setFilteredData((data?.list as IUserItemforlist[]) || []);
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
    console.log('应用筛选');

    // 只保留接口支持的搜索参数
    filters.setState({
      address: filtersForEdit.state.address,
      created_at_end: filtersForEdit.state.created_at_end,
      created_at_start: filtersForEdit.state.created_at_start,
      h_username: filtersForEdit.state.h_username,
      member_code: filtersForEdit.state.member_code,
      is_business: filtersForEdit.state.is_business,
      parent_code: filtersForEdit.state.parent_code,
    });
  };

  const handleParentAddressClick = useCallback((address: string) => {
    // 当点击上级地址时，将地址设置到筛选器中并执行筛选
    filtersForEdit.setState({ address });
    // 应用筛选
    handleFilterData();
    toast.info(`已筛选地址: ${address}`);
  }, [filtersForEdit]);

  // 会员类型选择对话框状态
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<1 | 2 | 3>(1);

  // 打开会员类型选择对话框
  const handleOpenTypeDialog = useCallback((userId: number | undefined, userType: 1 | 2 | 3) => {
    if (!userId) return;
    setSelectedUserId(userId);
    setSelectedType(userType);
    setOpenTypeDialog(true);
  }, []);

  // 关闭会员类型选择对话框
  const handleCloseTypeDialog = useCallback(() => {
    setOpenTypeDialog(false);
    setSelectedUserId(null);
  }, []);

  // 处理会员类型设置
  const handleSetMemberType = useCallback(async () => {
    if (!selectedUserId || !selectedType) return;

    try {
      const response = await setMemberTypeAPI({ id: selectedUserId, member_type: selectedType });
      if (response.data) {
        toast.success('会员类型设置成功');
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '设置失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      handleCloseTypeDialog();
    }
  }, [selectedUserId, selectedType, getList, handleCloseTypeDialog]);

  // 处理重置密码
  const handleResetPassword = useCallback((user: IUserItemforlist) => {
    setCurrentUserForResetPassword(user);
    setOpenResetPasswordDialog(true);
  }, []);

  // 更绑地址
  const handleAddress = useCallback((user: IUserItemforlist) => {
    setCurrentUserForAddress(user);
    setOpenAddressDialog(true);
  }, []);
  // 关闭更绑地址弹框
  const handleCloseAddressDialog = useCallback(() => {
    setOpenAddressDialog(false);
    setCurrentUserForAddress(null);
  }, []);
  // 提交更绑地址
  const handleSubmitAddress = useCallback(async (data: { id: number; new_address: string; surety: string }) => {
    const toastId = toast.loading('正在更绑地址...');
    try {
      const response = await updateMemberAddressAPI(data);
      if (response.code === 0) {
        toast.success('地址更绑成功');
        handleCloseAddressDialog();
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '地址更绑失败');
      }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      toast.dismiss(toastId);
    }
  }, [getList, handleCloseAddressDialog]);
  // 关闭重置密码弹窗
  const handleCloseResetPasswordDialog = useCallback(() => {
    setOpenResetPasswordDialog(false);
    setCurrentUserForResetPassword(null);
  }, []);

  // 提交重置密码
  const handleSubmitResetPassword = useCallback(async (data: ConfirmNodeSubscriptionRequest) => {
    const toastId = toast.loading('正在认购...');
    try {
      const response = await confrimNodeSubscriptionAPI(data);
      if (response.code === 0) {
        toast.success('认购成功');
        handleCloseResetPasswordDialog();
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '认购失败');
      }
    } catch (error: any) {
      console.error('认购失败:', error);
      toast.error(error.message || '认购失败');
    } finally {
      toast.dismiss(toastId);
    }
  }, [getList, handleCloseResetPasswordDialog]);

  // 会员类型映射
  const memberTypeMap = {
    1: '默认',
    2: '运营中心',
    3: '社区',
  };
  // 资金流水
  const handleCapitalFlow = useCallback((row: any,type:any) => {
    setCurrentUserForCapitalFlow(row);
    setCurrentUserForCapitalFlowType(type);
    setOpenCapitalFlowDialog(true);
  }, []);
  // 关闭资金流水
  const handleCloseCapitalFlowDialog = useCallback(() => {
    setOpenCapitalFlowDialog(false);
    setCurrentUserForCapitalFlow(null);
  }, []);

  // 更改上级处理函数
  const handleChangeSuperior = useCallback((user: IUserItemforlist) => {
    setCurrentUserForChangeSuperior(user);
    setOpenChangeSuperiorDialog(true);
  }, []);

  const handleCloseChangeSuperiorDialog = useCallback(() => {
    setOpenChangeSuperiorDialog(false);
    setCurrentUserForChangeSuperior(null);
  }, []);

  const handleSubmitChangeSuperior = useCallback(async (data: { id: number; parent_code: string | null }) => {
    try {
      // TODO: 这里需要添加更改上级的API调用
      // await changeSuperiorAPI(data);
      console.log('更改上级数据:', data);
      toast.success('上级更改成功');
      handleCloseChangeSuperiorDialog();
      getList();
    } catch (error) {
      console.error('更改上级失败:', error);
      toast.error('更改上级失败');
    }
  }, [getList, handleCloseChangeSuperiorDialog]);

  // 设置等级处理函数
  const handleSetLevel = useCallback((user: IUserItemforlist) => {
    setCurrentUserForSetLevel(user);
    setOpenSetLevelDialog(true);
  }, []);

  const handleCloseSetLevelDialog = useCallback(() => {
    setOpenSetLevelDialog(false);
    setCurrentUserForSetLevel(null);
  }, []);

  const handleSubmitSetLevel = useCallback(async (data: { p_level: string; s_level: string }) => {
    try {
      // TODO: 这里需要添加设置等级的API调用
      // await setUserLevelAPI({ userId: currentUserForSetLevel?.id, ...data });
      console.log('设置等级数据:', {
        userId: currentUserForSetLevel?.id,
        ...data,
      });
      toast.success('等级设置成功');
      handleCloseSetLevelDialog();
      getList();
    } catch (error) {
      console.error('设置等级失败:', error);
      toast.error('设置等级失败');
    }
  }, [currentUserForSetLevel?.id, getList, handleCloseSetLevelDialog]);

  // 处理用户状态切换确认
  const handleConfirmStatusChange = useCallback(async () => {
    if (!selectedUser) return;

    const toastId = toast.loading('正在更新用户状态...');
    try {
      const response = await updateUserStatusAPI({
        id: Number(selectedUser.id),
        status: newUserStatus,
      });

      if (response.data) {
        toast.success(`用户状态已更新为${newUserStatus === 'normal' ? '正常' : '封禁'}`, { id: toastId });
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '状态更新失败', { id: toastId });
      }
    } catch (error) {
      console.error('更新用户状态失败:', error);
      toast.error('状态更新失败', { id: toastId });
    } finally {
      setOpenStatusDialog(false);
      setSelectedUser(null);
    }
  }, [selectedUser, newUserStatus, getList]);

  // 处理用户地址状态切换确认
  const handleConfirmAddressStatusChange = useCallback(async () => {
    if (!selectedUserForAddressStatus) return;

    const toastId = toast.loading('正在更新地址状态...');
    try {
      const response = await updateMemberAddressStatusAPI({
        id: Number(selectedUserForAddressStatus.id),
        address_status: newAddressStatus,
      });

      if (response.data) {
        toast.success(`地址状态已更新为${newAddressStatus === 'normal' ? '正常' : '封禁'}`, { id: toastId });
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '地址状态更新失败', { id: toastId });
      }
    } catch (error) {
      console.error('更新地址状态失败:', error);
      toast.error('地址状态更新失败', { id: toastId });
    } finally {
      setOpenAddressStatusDialog(false);
      setSelectedUserForAddressStatus(null);
    }
  }, [selectedUserForAddressStatus, newAddressStatus, getList]);

  // 处理用户提现状态切换确认
  const handleConfirmWithdrawStatusChange = useCallback(async () => {
    if (!selectedUserForWithdrawStatus) return;

    const toastId = toast.loading('正在更新提现状态...');
    try {
      const response = await updateMemberWithdrawStatusAPI({
        id: Number(selectedUserForWithdrawStatus.id),
        withdraw_status: newWithdrawStatus,
      });

      if (response.data) {
        toast.success(`提现状态已更新为${newWithdrawStatus === 'normal' ? '正常' : '禁用'}`, { id: toastId });
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '提现状态更新失败', { id: toastId });
      }
    } catch (error) {
      console.error('更新提现状态失败:', error);
      toast.error('提现状态更新失败', { id: toastId });
    } finally {
      setOpenWithdrawStatusDialog(false);
      setSelectedUserForWithdrawStatus(null);
    }
  }, [selectedUserForWithdrawStatus, newWithdrawStatus, getList]);

  // 批量封禁处理函数
  const handleBatchBan = useCallback((user: IUserItemforlist) => {
    setCurrentUserForBatchBan(user);
    setOpenBatchBanDialog(true);
  }, []);

  const handleCloseBatchBanDialog = useCallback(() => {
    setOpenBatchBanDialog(false);
    setCurrentUserForBatchBan(null);
  }, []);

  const handleConfirmBatchBan = useCallback(async () => {
    if (!currentUserForBatchBan) return;

    const toastId = toast.loading('正在封禁用户...');
    try {
      const response = await updateMemberNetStatusAPI({
        id: Number(currentUserForBatchBan.id),
        status: 'blocked',
      });

      if (response.data) {
        toast.success('用户已成功封禁', { id: toastId });
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '封禁失败', { id: toastId });
      }
    } catch (error) {
      console.error('封禁用户失败:', error);
      toast.error('封禁失败', { id: toastId });
    } finally {
      handleCloseBatchBanDialog();
    }
  }, [currentUserForBatchBan, getList, handleCloseBatchBanDialog]);

  const handleConfirmBatchUnban = useCallback(async () => {
    if (!currentUserForBatchBan) return;

    const toastId = toast.loading('正在解封用户...');
    try {
      const response = await updateMemberNetStatusAPI({
        id: Number(currentUserForBatchBan.id),
        status: 'normal',
      });

      if (response.data) {
        toast.success('用户已成功解封', { id: toastId });
        getList(); // 刷新列表
      } else {
        toast.error(response.message || '解封失败', { id: toastId });
      }
    } catch (error) {
      console.error('解封用户失败:', error);
      toast.error('解封失败', { id: toastId });
    } finally {
      handleCloseBatchBanDialog();
    }
  }, [currentUserForBatchBan, getList, handleCloseBatchBanDialog]);

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const handleFilterHUsername = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ h_username: event.target.value });
    },
    [filtersForEdit]
  );

  const handleFilterMemberCode = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ member_code: event.target.value });
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

  const calcLevel =  (level:number | string) => {
    level = parseInt(`${level}`);
    const isD = level > 5 ;
    if (isD) {
      return `D${level - 5}`
    }
    return `P${level}`
  }

  const columns: GridColDef[] = [
    {
      field: 'address',
      headerName: '地址 ',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.address || '-'} />,
    },
    {
      field: 'dynamic_reward',
      headerName: '动态奖',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.dynamic_reward || '-'} />,
    },
    {
      field: 'ip',
      headerName: 'IP地址',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.ip || '-'} />,
    },
    {
      field: 'level',
      headerName: '等级',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.level || '-'} />,
    },
    {
      field: 'level_up_reward',
      headerName: '晋级奖励',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.level_up_reward || '-'} />,
    },
    {
      field: 'parent_id',
      headerName: '上级id',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.parent_id || '-'} />,
    },
    {
      field: 'power',
      headerName: '算力',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.power || '-'} />,
    },
    {
      field: 'receive_reward',
      headerName: '已领取奖励',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.receive_reward || '-'} />,
    },
    {
      field: 'receive_reward_usdt',
      headerName: '已领取奖励usdt价值',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.receive_reward_usdt || '-'} />,
    },
    {
      field: 'remark',
      headerName: '备注',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.remark || '-'} />,
    },
    {
      field: 'static_reward',
      headerName: 'nft 静态奖励',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.static_reward || '-'} />,
    },
    {
      field: 'team_power',
      headerName: '团队算力',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.team_power || '-'} />,
    },
    {
      field: 'team_usdt_recharge_amount',
      headerName: '团队USDT充值数量',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.team_usdt_recharge_amount || '-'} />,
    },
    {
      field: 'usdt_recharge_amount',
      headerName: 'USDT充值数量',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.usdt_recharge_amount || '-'} />,
    },
    {
      field: 'withdraw_limit',
      headerName: '提现额度',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.withdraw_limit || '-'} />,
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
        // 节点认购
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="mdi:currency-usd" />}
          label="节点认购"
          onClick={() => handleResetPassword(params.row)}
          disabled={false}
        />,
      ],
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
          heading="会员列表"
          links={[
            { name: '数据概览', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
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
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>

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

      {/* 重置密码对话框 */}
      {currentUserForResetPassword && (
        <Dialog
          fullWidth
          maxWidth="xs"
          open={openResetPasswordDialog}
          onClose={handleCloseResetPasswordDialog}
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
          <ResetPasswordForm
            currentUser={currentUserForResetPassword}
            open={openResetPasswordDialog}
            onClose={handleCloseResetPasswordDialog}
            onSubmitSuccess={handleSubmitResetPassword}
          />
        </Dialog>
      )}
      {/* 更绑地址对话框 */}
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
              minHeight: '40vh',
              '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
            },
          }}
        >
          <AddressForm
            currentUser={currentUserForAddress}
            open={openAddressDialog}
            onClose={handleCloseAddressDialog}
            onSubmitSuccess={handleSubmitAddress}
          />
        </Dialog>
      )}
      {/* 资金流水对话框 */}
      {openCapitalFlowDialog && currentUserForCapitalFlow && (
        <Dialog
          fullWidth
          maxWidth="lg"
          open={openCapitalFlowDialog}
          onClose={handleCloseCapitalFlowDialog}
          transitionDuration={{
            enter: theme.transitions.duration.shortest,
            exit: theme.transitions.duration.shortest - 80,
          }}
          PaperProps={{
            sx: {
              display: 'flex',
              overflow: 'hidden',
              flexDirection: 'column',
              minHeight: '70vh',
              '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
            },
          }}
        >
          <CapitalFlowForm
            currentUser={currentUserForCapitalFlow}
            type={currentUserForCapitalFlowType}
            open={openCapitalFlowDialog}
            onClose={handleCloseCapitalFlowDialog}
          />
        </Dialog>
      )}
      {/* 更改上级对话框 */}
      {currentUserForChangeSuperior && (
        <Dialog
          fullWidth
          maxWidth="sm"
          open={openChangeSuperiorDialog}
          onClose={handleCloseChangeSuperiorDialog}
          transitionDuration={{
            enter: theme.transitions.duration.shortest,
            exit: theme.transitions.duration.shortest - 80,
          }}
          PaperProps={{
            sx: {
              display: 'flex',
              overflow: 'hidden',
              flexDirection: 'column',
              minHeight: '50vh',
              '& form': { minHeight: 0, display: 'flex', flex: '1 1 auto', flexDirection: 'column' },
            },
          }}
        >
          <ChangeSuperiorForm
            currentUser={currentUserForChangeSuperior}
            open={openChangeSuperiorDialog}
            onClose={handleCloseChangeSuperiorDialog}
            onSubmitSuccess={handleSubmitChangeSuperior}
          />
        </Dialog>
      )}
      {/* 设置等级对话框 */}
      {currentUserForSetLevel && (
        <SetLevelForm
          open={openSetLevelDialog}
          onClose={handleCloseSetLevelDialog}
          onSuccess={getList}
          currentUser={{
            id: currentUserForSetLevel.id?.toString(),
            member_code: currentUserForSetLevel.member_code,
            virtual_level: currentUserForSetLevel.virtual_level,
            star_level: currentUserForSetLevel.star_level,
          }}
        />
      )}

      {/* 用户状态切换确认弹窗 */}
      <ConfirmDialog
        open={openStatusDialog}
        onClose={() => setOpenStatusDialog(false)}
        title="确认状态变更"
        content={`确定要将用户状态更改为${newUserStatus === 'normal' ? ' 正常 ' : ' 封禁 '}吗？`}
        action={
          <Button
            variant="contained"
            color={newUserStatus === 'normal' ? 'success' : 'error'}
            onClick={handleConfirmStatusChange}
          >
            确认
          </Button>
        }
      />

      {/* 用户地址状态切换确认弹窗 */}
      <ConfirmDialog
        open={openAddressStatusDialog}
        onClose={() => setOpenAddressStatusDialog(false)}
        title="确认地址状态变更"
        content={`确定要将地址状态更改为${newAddressStatus === 'normal' ? ' 正常 ' : ' 禁用 '}吗？`}
        action={
          <Button
            variant="contained"
            color={newAddressStatus === 'normal' ? 'success' : 'error'}
            onClick={handleConfirmAddressStatusChange}
          >
            确认
          </Button>
        }
      />

      {/* 用户提现状态切换确认弹窗 */}
      <ConfirmDialog
        open={openWithdrawStatusDialog}
        onClose={() => setOpenWithdrawStatusDialog(false)}
        title="确认提现状态变更"
        content={`确定要将提现状态更改为${newWithdrawStatus === 'normal' ? ' 正常 ' : ' 禁用 '}吗？`}
        action={
          <Button
            variant="contained"
            color={newWithdrawStatus === 'normal' ? 'success' : 'error'}
            onClick={handleConfirmWithdrawStatusChange}
          >
            确认
          </Button>
        }
      />

      {/* 批量封禁确认弹窗 */}
      <Dialog
        open={openBatchBanDialog}
        onClose={handleCloseBatchBanDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ pb: 2, pr: 6 }}>
          网体封禁/解封
          <IconButton
            onClick={handleCloseBatchBanDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ typography: 'body2' }}>
          此操作将批量封禁/解封该用户{currentUserForBatchBan?.member_code}和其所有伞下会员！
        </DialogContent>

        <DialogActions sx={{ gap: 1 }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmBatchBan}
          >
            封禁
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmBatchUnban}
          >
            解封
          </Button>
        </DialogActions>
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
