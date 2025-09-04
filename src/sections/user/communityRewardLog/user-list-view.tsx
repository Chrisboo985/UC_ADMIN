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
import type { ResponsesAdminCommunityRewardLog } from 'src/types/reward_log';
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
import Typography from '@mui/material/Typography';
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

import { round, toNumber } from 'lodash-es';
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

import {
  getMemberIndexAPI,
  batchSaveBondRatesAPI,
  withdrawBondBonusAPI,
  setRemarkAPI,
  setMemberTypeAPI,
  setTeamTypeAPI,
  setCkPurchaseMaxTimesAPI,
  setCkWhiteListAPI,
  removeTurbineAPI,
  setGameDifficultyCoefficientAPI,
  getCommunityRewardLogListAPI,
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

// 用户列表视图主组件community_reward_log
export function CommunityRewardLogView(props: { h: boolean }) {
  const { h: advancedUserListPage } = props;
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
  }>({
    address: '',
    created_at_end: null,
    created_at_start: null,
    id: '',
    order_direction: '',
    order_field: '',
    last_login_ip: '',
    remark: '',
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<ResponsesAdminCommunityRewardLog[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ResponsesAdminCommunityRewardLog[]>([]);
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
  const { copy } = useCopyToClipboard();
  // 添加状态控制 Dialog
  const [openForm, setOpenForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<ResponsesAdminCommunityRewardLog>(
    {} as ResponsesAdminCommunityRewardLog
  );
  const unblockConfirm = useBoolean();
  const blockConfirm = useBoolean();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [openPledgeForm, setOpenPledgeForm] = useState(false);
  const [openWithdrawBondBonusForm, setOpenWithdrawBondBonusForm] = useState(false);
  const [openReduceTurbineForm, setOpenReduceTurbineForm] = useState(false);
  const [openCkBuyNumForm, setOpenCkBuyNumForm] = useState(false);

  const [openDifficultyForm, setOpenDifficultyForm] = useState(false);

  // 筛选条件是否能够重置
  const canReset =
    !!filtersForEdit.state.address || !!filtersForEdit.state.id || !!filtersForEdit.state.remark;
  // const canReset = Object.values(filtersForEdit.state).some(
  //   (value) => value !== null && value !== '' && value !== undefined
  // );

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );
  // 设置会员类型
  const setMemberType = async (memberType: 1 | 2, id: number) => {
    const toastId = toast.loading('设置会员类型中');
    setMemberTypeAPI({ member_type: memberType, id })
      .then((res) => {
        if (res.code === 0) {
          toast.success('设置会员类型成功');
          return;
        }
        throw new Error('设置会员类型失败');
      })
      .catch((error) => toast.error('设置会员类型失败'))
      .finally(() => {
        toast.dismiss(toastId);
        getList();
      });
  };
  // 设置团队类型
  const setTeamType = async (team_type: 1 | 2 | 3, id: number) => {
    const toastId = toast.loading('设置团队类型中');
    await setTeamTypeAPI({ team_type, member_id: id })
      .then((res) => {
        if (res.code === 0) {
          toast.success('设置团队类型成功');
          return;
        }
        throw new Error('设置团队类型失败');
      })
      .catch((error) => toast.error('设置团队类型失败'))
      .finally(() => {
        toast.dismiss(toastId);
        getList();
      });
  };
  // 设置白名单
  const setWhiteList = async (is_white_list: 1 | 2, id: number) => {
    const toastId = toast.loading('设置白名单中');

    await setCkWhiteListAPI({ is_ck_white: is_white_list, member_id: id })
      .then((res) => {
        if (res.code === 0) {
          toast.success('设置白名单成功');
          return;
        }
        throw new Error('设置白名单失败');
      })
      .catch((error) => toast.error('设置白名单失败'))
      .finally(() => {
        toast.dismiss(toastId);
        getList();
      });
  };

  // 获取用户列表
  const getList = useCallback(async () => {
    const params = {
      ...filters.state,

      page: pagination.page,
      page_size: pagination.pageSize,
    };

    console.log('params', params);

    setUsersLoading(true);
    await getCommunityRewardLogListAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          // 如果为空，需要设置默认值
          setFilteredData((data?.list as ResponsesAdminCommunityRewardLog[]) || []);
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

  // 批量保存或更新用户债券比率
  const handleBatchSaveBondRates = async (data: any) => {
    await batchSaveBondRatesAPI(data);
  };

  // 设置CK购买数量
  const handleSetCkBuyNum = async (data: any) => {
    console.log('设置CK购买数量', data);
    const APIResult = await setCkPurchaseMaxTimesAPI(data);
    console.log('设置CK购买数量', APIResult);
    if (APIResult.code === 0) {
      toast.success('设置CK购买数量成功');
    } else {
      toast.error(APIResult.message || '设置CK购买数量失败');
    }
  };

  // 提现债券分红
  const handleWithdrawBondBonus = async (data: any) => {
    const APIResult = await withdrawBondBonusAPI(data);
    console.log('提现债券分红', APIResult);
    //   {
    //     "code": 1,
    //     "message": "提现金额大于可提金额",
    //     "data": null
    // }

    // 如果APIResult.message === success 就提醒成功
    if (APIResult.message === 'success') {
      toast.success('提现成功');
    } else {
      toast.error(APIResult.message);
    }
  };

  // 设置游戏难度系数
  const handleSetGameDifficultyCoefficient = async (data: any) => {
    const APIResult = await setGameDifficultyCoefficientAPI(data);
    console.log('设置游戏难度系数', APIResult);
    if (APIResult.code === 0) {
      toast.success('设置游戏难度系数成功');
    } else {
      toast.error(APIResult.message || '设置游戏难度系数失败');
    }
  };

  // 减少涡轮
  const handleReduceTurbine = async (data: any) => {
    const APIResult = await removeTurbineAPI(data);
    console.log('减少涡轮', APIResult);
    if (APIResult.code === 0) {
      toast.success('减少涡轮成功');
    } else {
      toast.error(APIResult.message || '减少涡轮失败');
    }
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
    });
  };

  // 修改备注处理方法
  const handleRemarkRow = useCallback((user: ResponsesAdminCommunityRewardLog) => {
    setCurrentUser(user);
    setOpenForm(true);
  }, []);

  // 会员类型选择对话框状态
  const [openTypeDialog, setOpenTypeDialog] = useState(false);
  const [selectedType, setSelectedType] = useState<1 | 2 | 3>(1);

  // 打开会员类型选择对话框
  const handleOpenTypeDialog = useCallback((userId: number, userType: 1 | 2 | 3) => {
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
    if (!selectedUserId) return;

    try {
      // API now accepts type 3 as well
      await setMemberTypeAPI({
        member_type: selectedType,
        id: selectedUserId,
      });
      toast.success('设置会员类型成功');
    } catch (error) {
      toast.error('设置会员类型失败');
    } finally {
      getList(); // 刷新列表
      handleCloseTypeDialog();
    }
  }, [selectedUserId, selectedType, getList, handleCloseTypeDialog]);

  // 会员类型映射
  const memberTypeMap = {
    1: '默认',
    2: '运营中心',
    3: '社区',
  };

  const handleBlock = useCallback(async () => {
    if (!selectedUserId) return;

    try {
      // // const response = await blockUserAPI(selectedUserId);
      // if (response.code === 0) {
      toast.success('封禁成功');
      //   getList(); // 刷新列表
      // } else {
      //   toast.error(response.message || '封禁失败');
      // }
    } catch (error) {
      toast.error('操作失败');
    } finally {
      blockConfirm.onFalse();
      setSelectedUserId(null);
    }
  }, [selectedUserId, blockConfirm]);

  // 关闭弹窗
  const handleCloseForm = useCallback(() => {
    setOpenForm(false);
    // 不能设为空， 需要设置为空对象，存在默认值，不然组件会报错
    setCurrentUser({} as ResponsesAdminCommunityRewardLog);
  }, []);

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
  const handleFilterLastLoginIP = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ last_login_ip: event.target.value });
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

  const handleCloseDifficultyForm = useCallback(() => {
    setOpenDifficultyForm(false);
    setCurrentUser({} as ResponsesAdminCommunityRewardLog);
  }, []);

  const handleCloseWithdrawBondBonusForm = useCallback(() => {
    setOpenWithdrawBondBonusForm(false);
    setCurrentUser({} as ResponsesAdminCommunityRewardLog);
  }, []);
  const handleCloseCkBuyNumForm = useCallback(() => {
    setOpenCkBuyNumForm(false);
    setCurrentUser({} as ResponsesAdminCommunityRewardLog);
  }, []);

  const handleCloseReduceTurbineForm = useCallback(() => {
    setOpenReduceTurbineForm(false);
    setCurrentUser({} as ResponsesAdminCommunityRewardLog);
  }, []);

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
      field: 'date',
      headerName: '日期',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.date} />,
    },
    {
      field: 'Member.address',
      headerName: '用户地址',
      minWidth: 210,
      flex: 1,
      // 展示前后五位
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.Member.address} props={{ displayLength: 16 }} />
      ),
    },

    // {
    //   field: 'ParentMember.address',
    //   headerName: '上级地址',
    //   minWidth: 190,
    //   flex: 1,
    //   renderCell: (params) => {
    //     const value = params.row.ParentMember.address;
    //     const displayLength = 16;
    //     const displayValue = `${value.slice(0, displayLength / 2)}...${value.slice(-displayLength / 2)}`;
    //     const hadleCopy = () => {
    //       if (!value) return;
    //       copy(value);
    //       toast.success('复制成功!');
    //     };
    //     return (
    //       <Tooltip title={params.row.ParentMember.address} placement="top">
    //         <Stack
    //           onClick={() => handleParentAddressClick(value)}
    //           direction="row"
    //           alignItems="center"
    //           spacing={0.5}
    //           sx={{
    //             width: '100%',
    //             position: 'relative',
    //             cursor: 'pointer',
    //             '&:hover .copy-icon': {
    //               opacity: 1,
    //             },
    //           }}
    //         >
    //           <div
    //             style={{
    //               whiteSpace: 'nowrap',
    //               overflow: 'hidden',
    //               textOverflow: 'ellipsis',
    //               flex: 1,
    //               color: '#1890ff',
    //             }}
    //           >
    //             {displayValue || '-'}
    //           </div>

    //           {!!displayValue && (
    //             <IconButton
    //               size="small"
    //               onClick={hadleCopy}
    //               className="copy-icon"
    //               sx={{
    //                 opacity: 0,
    //                 transition: 'opacity 0.3s ease',
    //               }}
    //             >
    //               <Iconify width={18} icon="solar:copy-bold" />
    //             </IconButton>
    //           )}
    //         </Stack>
    //       </Tooltip>
    //     );
    //   },
    // },

    // 权重奖励
    // {
    //   field: 'community_reward',
    //   headerName: '权重奖励',
    //   minWidth: 190,
    //   flex: 1,
    //   renderCell: (params) => {
    //     // 权重系数*(大团队补偿金额+小团队总质押金额)/(全网团队质押金额+自定义全网团队质押金额)*rebase利息金*权重奖励波比
    //     // 将可能的字符串转为数字
    //     const weightCoefficient = Number(params.row.weight || 0);
    //     const bigTeamCompensationAmount = Number(params.row.large_team_compensation_amount || 0);
    //     const smallTeamStakingAmount = Number(params.row.small_team_all_stake_amount || 0);
    //     const networkTeamStakingAmount = Number(params.row.all_network_team_stake_amount || 0);
    //     const customNetworkTeamStakingAmount = Number(
    //       params.row.custom_all_network_team_stake_amount || 0
    //     );
    //     const rebaseInterest = Number(params.row.rebase_interest_amount || 0);
    //     // 波比默认1.0，可以根据需要调整
    //     const communityRewardRatio = Number(params.row.community_reward_rate || 1.0);

    //     // 计算分子
    //     const numerator = bigTeamCompensationAmount + smallTeamStakingAmount;
    //     // 计算分母
    //     const denominator = networkTeamStakingAmount + customNetworkTeamStakingAmount;

    //     let result = 0;
    //     if (denominator !== 0) {
    //       result =
    //         weightCoefficient * (numerator / denominator) * rebaseInterest * communityRewardRatio;
    //     }

    //     // 保留所有小数位
    //     return <CellWithTooltipCopy value={String(result)} />;
    //   },
    // },

    // // 社区新增业绩奖励
    // {
    //   field: 'community_new_performance_reward',
    //   headerName: '社区新增业绩奖励',
    //   minWidth: 190,
    //   flex: 1,
    //   renderCell: (params) => {
    //     // 权重系数*(增量大团队补偿金额+增量小团队总质押金额)/(增量全网团队质押金额+自定义增量全网团队质押金额)*rebase利息金*社区新增奖励波比
    //     // 将可能的字符串转为数字
    //     const weightCoefficient = Number(params.row.weight || 0);
    //     const incrBigTeamCompensationAmount = Number(
    //       params.row.incr_large_team_compensation_amount || 0
    //     );
    //     const incrSmallTeamStakingAmount = Number(params.row.incr_small_team_all_stake_amount || 0);
    //     const incrNetworkTeamStakingAmount = Number(
    //       params.row.incr_all_network_team_stake_amount || 0
    //     );
    //     const customIncrNetworkTeamStakingAmount = Number(
    //       params.row.custom_incr_all_network_team_stake_amount || 0
    //     );
    //     const rebaseInterest = Number(params.row.rebase_interest_amount || 0);
    //     // 波比默认1.0，可以根据需要调整
    //     const communityNewRewardRatio = Number(params.row.incr_community_reward_rate || 1.0);

    //     // 计算分子
    //     const numerator = incrBigTeamCompensationAmount + incrSmallTeamStakingAmount;
    //     // 计算分母
    //     const denominator = incrNetworkTeamStakingAmount + customIncrNetworkTeamStakingAmount;

    //     let result = 0;
    //     if (denominator !== 0) {
    //       result =
    //         weightCoefficient *
    //         (numerator / denominator) *
    //         rebaseInterest *
    //         communityNewRewardRatio;
    //     }

    //     // 保留所有小数位
    //     return <CellWithTooltipCopy value={String(result)} />;
    //   },
    // },

    {
      field: 'weight',
      headerName: '权重系数',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.weight} />,
    },

    // {
    //   field: 'id',
    //   headerName: '主键ID',
    //   minWidth: 190,
    //   flex: 1,
    //   renderCell: (params) => (
    //     <CellWithTooltipCopy value={params.row.id} />
    //   ),
    // },

    {
      field: 'vcksp_reward_amount',
      headerName: '权重奖励',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <Box lineHeight={1.5}>
          预计:{params.row.vcksp_reward_amount}
          <br />
          实发:{params.row.actual_vcksp_reward_amount}
        </Box>
      ),
    },

    {
      field: 'incr_vcksp_reward_amount',
      headerName: '社区新增奖励',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <Box lineHeight={1.5}>
          预计:{params.row.incr_vcksp_reward_amount}
          <br />
          实发:{params.row.actual_incr_vcksp_reward_amount}
        </Box>
      ),
    },

    {
      field: 'large_team_compensation_amount',
      headerName: '大团队补偿金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.large_team_compensation_amount} />
      ),
    },
    {
      field: 'small_team_all_stake_amount',
      headerName: '小团队总质押金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.small_team_all_stake_amount} />
      ),
    },

    {
      field: 'all_network_team_stake_amount',
      headerName: '全网团队质押金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.all_network_team_stake_amount} />
      ),
    },

    {
      field: 'custom_all_network_team_stake_amount',
      headerName: '自定义全网团队质押金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.custom_all_network_team_stake_amount} />
      ),
    },

    {
      field: 'rebase_interest_amount',
      headerName: 'Rebase利息金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.rebase_interest_amount} />,
    },

    {
      field: 'community_reward_rate',
      headerName: '权重奖励波比',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.community_reward_rate} />,
    },

    {
      field: 'incr_large_team_compensation_amount',
      headerName: '增量大团队补偿金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.incr_large_team_compensation_amount} />
      ),
    },

    {
      field: 'incr_small_team_all_stake_amount',
      headerName: '增量小团队总质押金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.incr_small_team_all_stake_amount} />
      ),
    },

    {
      field: 'incr_all_network_team_stake_amount',
      headerName: '增量全网团队质押金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.incr_all_network_team_stake_amount} />
      ),
    },

    {
      field: 'custom_incr_all_network_team_stake_amount',
      headerName: '自定义增量全网团队质押金额',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.custom_incr_all_network_team_stake_amount} />
      ),
    },

    {
      field: 'incr_community_reward_rate',
      headerName: '社区新增奖励波比',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.incr_community_reward_rate} />,
    },
    {
      field: 'updated_at_string',
      headerName: '更新时间字符串',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.updated_at_string} />,
    },

    // {
    //   field: 'created_at_string',
    //   headerName: '创建时间字符串',
    //   minWidth: 190,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.created_at_string} />,
    // },

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
        //   icon={<Iconify icon="solar:card-bold" />}
        //   label="备注"
        //   onClick={() => handleRemarkRow(params.row)}
        //   disabled={false}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:account-convert" />}
        //   label="设置会员类型"
        //   onClick={() => handleOpenTypeDialog(params.row.id, params.row.type)}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="solar:lock-bold" />}
        //   label="封禁"
        //   onClick={() => {
        //     setSelectedUserId(params.row.id);
        //     blockConfirm.onTrue();
        //   }}
        //   disabled={params.row.is_blocked}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:cash-lock" />}
        //   label="设置帕点"
        //   onClick={() => handlePledgeRow(params.row)}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:cash-lock" />}
        //   label="提现债券分红"
        //   onClick={() => handleWithdrawBondBonusRow(params.row)}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:cash-lock" />}
        //   label="减少涡轮"
        //   onClick={() => handleReduceTurbineRow(params.row)}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:cash-lock" />}
        //   label="设置CK购买数量"
        //   onClick={() => handleSetCkBuyNumRow(params.row)}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="mdi:cash-lock" />}
        //   label="设置游戏难度系数"
        //   onClick={() => handleSetGameDifficultyCoefficientRow(params.row)}
        // />,
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
          heading="社区奖励列表"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
            { name: '社区奖励列表' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
          action={
            <Stack
              direction="column"
              spacing={1}
              sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: '#f5f5f5' }}
            >
              <Stack direction="row" spacing={1} sx={{ pl: 2 }}>
                <Box
                  sx={{
                    width: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'right',
                  }}
                >
                  <Typography sx={{ fontWeight: 'medium' }}>权重奖励 =</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ pl: 3 }} alignItems="center">
                  <Typography component="span" sx={{ color: 'primary.main', fontSize: 14 }}>
                    权重系数
                  </Typography>
                  <Typography component="span" sx={{ fontSize: 14 }}>
                    {' '}
                    ×{' '}
                  </Typography>
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: 14 }}>
                      (大团队补偿金额 + 小团队总质押金额)
                    </Typography>

                    {/* 分割线 */}
                    <Box sx={{ borderBottom: '1px solid #999', pb: 0.5, mb: 0.5, width: '100%' }} />
                    <Typography component="span" sx={{ fontSize: 14 }}>
                      (全网团队质押金额 + 自定义全网团队质押金额)
                    </Typography>
                  </Box>
                  <Typography component="span" sx={{ fontSize: 14 }}>
                    {' '}
                    × Rebase利息金额 × 权重奖励波比
                  </Typography>
                </Stack>
              </Stack>

              {/* 分割线 */}
              <Box sx={{ borderBottom: '1px solid #dedede' }} />
              <Stack direction="row" spacing={1} sx={{ pl: 2 }}>
                <Box
                  sx={{
                    width: '150px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'right',
                  }}
                >
                  <Typography sx={{ fontWeight: 'medium' }}>社区新增业绩奖励 = </Typography>
                </Box>
                <Stack sx={{ pl: 3 }} direction="row" spacing={1} alignItems="center">
                  <Typography component="span" sx={{ color: 'primary.main', fontSize: 14 }}>
                    权重系数
                  </Typography>
                  <Typography component="span"> × </Typography>
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Typography component="span" sx={{ fontSize: 14 }}>
                      (增量大团队补偿金额 + 增量小团队总质押金额)
                    </Typography>
                    {/* 分割线 */}
                    <Box sx={{ borderBottom: '1px solid #999', pb: 0.5, mb: 0.5, width: '100%' }} />
                    <Typography component="span" sx={{ fontSize: 14 }}>
                      (增量全网团队质押金额 + 自定义增量全网团队质押金额)
                    </Typography>
                  </Box>
                  <Typography component="span" sx={{ fontSize: 14 }}>
                    {' '}
                    × Rebase利息金额 × 社区新增奖励波比
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          }
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

            {advancedUserListPage && (
              <FormControl
                component="fieldset"
                sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}
              >
                <TextField
                  fullWidth
                  value={filtersForEdit.state.last_login_ip}
                  onChange={handleFilterLastLoginIP}
                  placeholder="请输入最后登录IP"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </FormControl>
            )}

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

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>

          {/* 数据表格，采用服务端管理数据模式 */}
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
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

      {/* <ConfirmDialog
        open={unblockConfirm.value}
        onClose={unblockConfirm.onFalse}
        title="解封"
        content="确定要解封该用户吗?"
        action={
          <Button variant="contained" color="primary" onClick={handleUnblock}>
            确认
          </Button>
        }
      /> */}

      {/* 会员类型选择对话框 */}
      <Dialog open={openTypeDialog} onClose={handleCloseTypeDialog} maxWidth="xs" fullWidth>
        <DialogTitle>设置会员类型</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 1 | 2 | 3)}
              >
                <MenuItem value={1}>{memberTypeMap[1]}</MenuItem>
                <MenuItem value={2}>{memberTypeMap[2]}</MenuItem>
                <MenuItem value={3}>{memberTypeMap[3]}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTypeDialog} color="inherit" variant="outlined">
            取消
          </Button>
          <Button onClick={handleSetMemberType} color="primary" variant="contained">
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={blockConfirm.value}
        onClose={blockConfirm.onFalse}
        title="封禁"
        content="确定要封禁该用户吗?"
        action={
          <Button variant="contained" color="error" onClick={handleBlock}>
            确认
          </Button>
        }
      />

      {/* <Dialog
        fullWidth
        maxWidth="xs"
        open={openForm}
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
        <DialogTitle sx={{ minHeight: 76 }}>添加备注</DialogTitle>

        <RemarkForm
          currentEvent={currentUser}
          onClose={handleCloseForm}
          // 可选: 添加成功后的回调，用于刷新列表
          onSuccess={async (data) => {
            await setRemarkAPI({
              id: currentUser.id,
              remark: data.remark,
            });

            handleCloseForm();
            getList();
            toast.success('备注更新成功');
          }}
        />
      </Dialog> */}

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openDifficultyForm}
        onClose={handleCloseDifficultyForm}
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
        <DialogTitle sx={{ minHeight: 76 }}>设置游戏难度系数</DialogTitle>

        <DifficultyForm
          currentEvent={currentUser}
          onClose={handleCloseDifficultyForm}
          // 可选: 添加成功后的回调，用于刷新列表
          onSuccess={async (data) => {
            await handleSetGameDifficultyCoefficient(data);

            handleCloseDifficultyForm();
            getList();
          }}
        />
      </Dialog>

      {/* <Dialog
        fullWidth
        maxWidth="xs"
        open={openWithdrawBondBonusForm}
        onClose={handleCloseWithdrawBondBonusForm}
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
        <DialogTitle sx={{ minHeight: 76 }}>提现债券分红</DialogTitle>

        <BondDividendWithdrawalForm
          currentEvent={currentUser}
          onClose={handleCloseWithdrawBondBonusForm}
          onSuccess={async (data) => {
            console.log('提现债券分红', data);
            await handleWithdrawBondBonus(data);
            handleCloseWithdrawBondBonusForm();
            await getList();
            // toast.success('提现成功');
          }}
        />
      </Dialog> */}

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openCkBuyNumForm}
        onClose={handleCloseCkBuyNumForm}
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
        <DialogTitle sx={{ minHeight: 76 }}>设置CK购买数量</DialogTitle>

        <CkBuyNumForm
          currentEvent={currentUser}
          onClose={handleCloseCkBuyNumForm}
          onSuccess={async (data) => {
            console.log('设置CK购买数量', data);
            await handleSetCkBuyNum(data);
            handleCloseCkBuyNumForm();
            await getList();
            // toast.success('提现成功');
          }}
        />
      </Dialog>

      {/* <Dialog
        fullWidth
        maxWidth="xs"
        open={openReduceTurbineForm}
        onClose={handleCloseReduceTurbineForm}
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
        <DialogTitle sx={{ minHeight: 76 }}>减少涡轮</DialogTitle>

        <ReduceTurbineForm
          currentEvent={currentUser}
          onClose={handleCloseReduceTurbineForm}
          onSuccess={async (data) => {
            console.log('减少涡轮', data);
            await handleReduceTurbine(data);
            handleCloseReduceTurbineForm();
            await getList();
            // toast.success('减少涡轮成功');
          }}
        />
      </Dialog> */}

      {/* <Dialog
        fullWidth
        maxWidth="xs"
        open={openPledgeForm}
        onClose={handleClosePledgeForm}
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
        <DialogTitle sx={{ minHeight: 76 }}>设置帕点</DialogTitle>
        <PledgeForm
          bonds={bonds}
          currentEvent={currentUser}
          onClose={handleClosePledgeForm}
          // 可选: 添加成功后的回调，用于刷新列表
          onSuccess={async (data) => {
            await handleBatchSaveBondRates(data);
            handleClosePledgeForm();
            await getList();
            toast.success('设置帕点成功');
          }}
        />
      </Dialog> */}
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
