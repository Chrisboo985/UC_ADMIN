import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
import { useTheme , alpha} from '@mui/material/styles';
import { varAlpha } from 'src/theme/styles';
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridRowId,
  GridRowSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridSlots,
  GridColumnVisibilityModel,
  gridClasses,
} from '@mui/x-data-grid';
import dayjs from 'dayjs';
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
import { getMemberPerformanceBondPurchaseGather } from 'src/api/user';
import { getBondIndexAPI, BondData } from 'src/api/lgns';
// types
import type { IDatePickerControl } from 'src/types/common';
import { IUserTableFiltersForList, IBondPurchaseGatherItem } from 'src/types/user';
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

export default function UserListView(): JSX.Element {
  const theme = useTheme();
  const router = useRouter();
  const { copy } = useCopyToClipboard();

  // 获取当前月第一天和当前日期
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = dayjs(firstDayOfMonth);
  const endDate = dayjs(now);

  // 弹窗
  const openFilterName = useBoolean();
  const openDateRange = useBoolean();

  const filters = useSetState<IUserTableFiltersForList>({
    address: '',
    created_at_end: endDate.unix(), // 当前日期的时间戳
    created_at_start: startDate.unix(), // 当月第一天的时间戳
    id: undefined,
    order_direction: '',
    order_field: '',
    last_login_ip: '',
    remark: '',
    type: undefined,
    // 移除了only_member和member_code属性
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
    // 已移除only_member和member_code属性
    bond_id?: number | undefined;
    community_name?: string; // 添加社区名称属性
    purchase_method?: 0 | 1 | 2; // 购买方式: 0 全部，1 ksp分叉买入, 2 dapp买入
  }>({
    address: '',
    created_at_end: endDate, // Dayjs对象
    created_at_start: startDate, // Dayjs对象
    id: '',
    order_direction: '',
    order_field: '',
    last_login_ip: '',
    remark: '',
    type: undefined,
    bond_id: undefined,
    community_name: '', // 社区名称初始值
    purchase_method: 0, // 购买方式默认值
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start: IDatePickerControl;
    end: IDatePickerControl;
  }>({
    start: startDate,
    end: endDate,
  });

  // 列表数据
  const [tableData, setTableData] = useState<IBondPurchaseGatherItem[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<IBondPurchaseGatherItem[]>([]);
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

  const [columns, setColumns] = useState<GridColDef[]>([]);
  
  // 债券列表
  const [bonds, setBonds] = useState<BondData[]>([]);

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.address || !!filtersForEdit.state.id || !!filtersForEdit.state.remark || filtersForEdit.state.bond_id !== undefined;

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );
 
  // 获取债券列表数据 - 移除对bonds的依赖，防止不必要的函数重建
  const fetchBondData = useCallback(async () => {
    // 如果债券列表已经有数据，则不再重复请求
    if (bonds.length > 0) {
      console.log('债券列表已经加载，使用缓存数据');
      return bonds;
    }

    try {
      const response = await getBondIndexAPI({
        page: 1,
        page_size: 100
      });

      console.log('获取债券列表响应', response);
      if (response.data) {
        const bondData = response.data.list;
        // 按照ID进行升序排序
        const sortedBonds = bondData.sort((a, b) => a.id - b.id);
        setBonds(sortedBonds);
        
        // 债券数据加载后立即生成列
        setTimeout(() => {
          composeColumns();
          console.log('债券数据加载完成后自动生成列');
        }, 0);
        
        return sortedBonds;
      }
      return [];
    } catch (error) {
      console.error('获取债券列表失败:', error);
      toast.error('获取债券列表失败!');
      return [];
    }
  }, [/* 故意移除bonds依赖，避免不必要的函数重建 */]); // composeColumns会在调用处使用

  // 应用前端过滤的辅助函数
  const applyClientFilter = (data: IBondPurchaseGatherItem[]) => {
    if (!data || data.length === 0) return [];
    
    // 获取当前过滤条件
    const { address, community_name } = filtersForEdit.state;
    
    // 如果没有过滤条件，直接返回原始数据
    if (!address && !community_name) {
      return data;
    }

    // 先过滤出符合条件的非分隔行的记录
    const filteredItems = data.filter(item => {
      // 分隔行不参与过滤
      if (item.is_divider) {
        return false;
      }

      // 社区地址筛选
      if (address && item.member_address) {
        if (!item.member_address.toLowerCase().includes(address.toLowerCase())) {
          return false;
        }
      }
      
      // 社区名称筛选(使用remark字段)
      if (community_name) {
        // 仅当用户输入了社区名称时才进行过滤
        if (!item.remark || typeof item.remark !== 'string' || item.remark.trim() === '') {
          // 如果remark不存在、不是字符串或为空，则不匹配
          return false;
        }
        // 如果remark存在且非空，则进行比较
        if (!item.remark.trim().toLowerCase().includes(community_name.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });

    // 找出需要保留的分隔行
    // 对于列表中的每一个分隔行，检查其后面是否有任何保留的type=2的记录
    const result: IBondPurchaseGatherItem[] = [];
    let includeDivider = false;

    // 遍历原始数据
    for (let i = 0; i < data.length; i++) {
      const currentItem = data[i];
      
      if (currentItem.is_divider) {
        // 记录当前的分隔行
        includeDivider = false;
        
        // 如果当前是分隔行，则查找下一个 type === 2 的记录是否被保留
        for (let j = i + 1; j < data.length; j++) {
          if (data[j].type === 2 && filteredItems.some(item => item.id === data[j].id)) {
            includeDivider = true;
            break;
          }
          // 如果过滤到下一个分隔行或到达列表结尾，则结束搜索
          if (data[j].is_divider || data[j].type !== 2) {
            break;
          }
        }
        
        // 仅当至少存在一个保留的type=2记录时，添加分隔行
        if (includeDivider) {
          result.push(currentItem);
        }
      } else if (filteredItems.some(item => item.id === currentItem.id)) {
        // 如果当前记录被过滤保留，则添加到结果中
        result.push(currentItem);
      }
    }

    return result;
  };
  
  // 获取债券购买汇总列表
  // 上次请求的参数
  const [lastQueryParams, setLastQueryParams] = useState<{start?: number, end?: number} | null>(null);

  // 防抖函数 hook - 使用 useRef 存储回调函数以避免重新创建
  function useDebounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
    const timer = useRef<NodeJS.Timeout | null>(null);
    const funcRef = useRef<T>(func); // 使用 ref 存储函数
    
    // 更新函数 ref
    useEffect(() => {
      funcRef.current = func;
    }, [func]);

    // 返回的函数不依赖于 func，而是使用 ref 中的版本
    return useCallback((...args: Parameters<T>) => {
      // 清除之前的定时器
      if (timer.current) {
        clearTimeout(timer.current);
      }
      
      // 设置新的定时器，使用 ref 中的函数
      timer.current = setTimeout(() => {
        funcRef.current(...args);
      }, delay);
    }, [delay]); // 只依赖于 delay，不依赖于 func
  }

  // 判断是否需要发起服务端请求
  const shouldFetchFromServer = useCallback((startTime: number, endTime: number): boolean => {
    // 如果是强制刷新，始终发起请求
    if (lastQueryParams === null) return true;
    
    // 如果时间范围有变化，需要发起请求
    if (lastQueryParams.start !== startTime || lastQueryParams.end !== endTime) return true;
    
    // 其他情况下不需要重新请求
    return false;
  }, [lastQueryParams]);

  // 原始getList函数定义
  const getListOriginal = useCallback(async (forceRefresh: boolean = false): Promise<void> => {
    // 准备请求参数，只使用时间条件请求服务端，其他条件在前端筛选处理
    const params: {
      created_at_end: number;
      created_at_start: number;
      purchase_method?: 0 | 1 | 2; // 添加购买方式参数
    } = {
      created_at_end: filters.state.created_at_end || endDate.unix(),
      created_at_start: filters.state.created_at_start || startDate.unix(),
      purchase_method: filters.state.purchase_method, // 传入购买方式参数
    };

    // 判断是否需要发起请求
    // if (!forceRefresh && !shouldFetchFromServer(params.created_at_start, params.created_at_end)) {
    //   console.log('使用相同参数的查询已存在，跳过重复请求');
    //   // 已有数据时，只应用前端过滤
    //   if (tableData.length > 0) {
    //     const filteredResults = applyClientFilter(tableData);
    //     setFilteredData(filteredResults);
    //     setTotalCount(filteredResults.length);
    //     console.log('仅应用前端过滤，原始数据数量:', tableData.length, '筛选后数量:', filteredResults.length);
    //     return;
    //   }
    // }

    setUsersLoading(true);
    try {
      // 确保债券数据已经加载完成
      if (bonds.length === 0) {
        console.log('等待债券数据加载...');
        // 如果没有债券数据，可能需要额外处理
        return;
      }
      
      // 获取债券购买汇总数据
      const apiResult = await getMemberPerformanceBondPurchaseGather(params);
      console.log('接口返回结果', apiResult);
      const { data, code, message } = apiResult;
      
      if (code === 0) {
        console.log('查询参数', params);
        // 保存查询参数防止重复请求
        setLastQueryParams({
          start: params.created_at_start,
          end: params.created_at_end
        });
        // 如果为空，需要设置默认值
        const rawList = data?.list as IBondPurchaseGatherItem[] || [];
        const formattedList: any[] = [];
        
        // 遍历原始数据，处理特殊条件
        rawList.forEach(item => {
          // 如果 type === 2，先插入空记录
          if (item.type === 2) {
            // 创建一个空记录
            const emptyRecord = {
              id: Math.random().toString(36).substring(2, 15),
              bond_gather: '',               // 空字符串不显示数值
              member_address: '',
              remark: ' ',  // 加分隔线作为标识
              type: -1,                      // 特殊类型表示这是一个插入的空记录
              is_divider: true,              // 添加标识字段表示这是分隔线
              bond_purchase_map: {}
            };
            
            // 扁平化空记录的债券数据
            const emptyBondData: any = {};
            bonds.forEach(bond => {
            });
            
            // 将空记录添加到列表中
            formattedList.push({
              ...emptyRecord,
              ...emptyBondData
            });
          }
          
          // 基础数据
          const baseItem = {
            ...item,
            id: Math.random().toString(36).substring(2, 15) // 生成随机ID作为列表唯一标识
          };
          
          // 将bond_purchase_map扁平化为普通属性
          const flattenedBondData: any = {};
          bonds.forEach(bond => {
            // 使用bond_${id}作为属性名，确保唯一性
            flattenedBondData[`bond_${bond.id}`] = item.bond_purchase_map?.[`bond_${bond.id}`] || 0;
          });
          
          // 将当前记录添加到列表中
          formattedList.push({
            ...baseItem,
            ...flattenedBondData
          });
        });
        
        setFilteredData(formattedList);
        setTotalCount(data?.total || 0);
        
        // 保存债券购买统计数据
        if (data?.statistics_amount) {
          setBondStats({
            usdt_amount: data.statistics_amount.usdt_amount || '0',
            expected_ksp_amount: data.statistics_amount.expected_ksp_amount || '0',
            calc_ksp_amount: data.statistics_amount.calc_ksp_amount || '0',
          });
        }
        
        // 确保先有债券数据，再构建列，最后设置数据
        if (bonds.length > 0) {
          // 先构建列
          composeColumns();
          // 再更新数据
          setTableData(formattedList);
          
          // 应用前端过滤
          const filteredResults = applyClientFilter(formattedList);
          setFilteredData(filteredResults);
          setTotalCount(filteredResults.filter(item => !item.is_divider).length);
          
          console.log('原始数据数量:', formattedList.length, '筛选后数量:', filteredResults.length);
        } else {
          console.error('债券列表为空，无法构建债券列');
          toast.warning('未能获取到债券类型信息，列表可能不完整');
        }
      } else {
        toast.error(message || '数据获取失败');
        console.log('查询参数', params);
        // 请求失败时重置lastQueryParams，下次将重新请求
        setLastQueryParams(null);
      }
    } catch (error) {
      console.error('获取列表失败:', error);
      if (error instanceof Error) {
        toast.error(`获取列表失败: ${error.message}`);
      } 
      // 异常情况下也重置lastQueryParams
      setLastQueryParams(null);
    } finally {
      setUsersLoading(false);
    }
  }, [filters.state.created_at_end, filters.state.created_at_start, bonds, tableData, applyClientFilter, shouldFetchFromServer]);

  // 防抖版本的getList函数，延迟300毫秒
  const getList = useDebounce(getListOriginal, 300);

  // 根据查询时间范围生成文件名后缀 - 使用useCallback确保依赖变化时重新计算
  const getFilenameDateSuffix = useCallback(() => {
    // 如果时间过滤条件存在，生成时间范围文件名
    console.log('生成导出文件名，当前搜索条件：', filters.state);
    if (filters.state.created_at_start && filters.state.created_at_end) {
      // 将unix时间戳转换为日期字符串
      const startDate = dayjs.unix(filters.state.created_at_start).format('YYYY-MM-DD');
      const endDate = dayjs.unix(filters.state.created_at_end).format('YYYY-MM-DD');
      
      // 如果开始和结束日期相同，只显示一个日期
      if (startDate === endDate) {
        return `-${startDate}`;
      }
      // 否则显示时间范围
      return `-${startDate}_${endDate}`;
    }
    
    // 如果没有设置时间范围，使用当前日期
    return `-${dayjs().format('YYYY-MM-DD')}`;
  }, [filters.state.created_at_start, filters.state.created_at_end]); // 添加时间过滤条件作为依赖项

// 动态组装列 - 保存为函数声明而不是useCallback
function composeColumns(): void {
  console.log('开始组装列，当前债券数据:', bonds);
  if (bonds.length === 0) {
    console.error('债券数据为空，无法生成债券列');
    // toast.warning('未能获取到债券数据，请刷新页面重试');
    return;
  }
  
  // 基础列定义
  const baseColumns: GridColDef[] = [
    {
      field: 'member_address',
      headerName: '社区地址',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        params.row.is_divider ? ' ' : <CellWithTooltipCopy value={params.row.member_address} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'remark',
      headerName: '社区名称',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        params.row.is_divider ? ' ' : <CellWithTooltipCopy value={params.row.remark || '未设置'} props={{ displayLength: 20 }} />
      ),
    },
    {
      field: 'bond_gather',
      headerName: '总购买量(USDT)',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        params.row.is_divider ? ' ' : <CellWithTooltipCopy value={params.row.bond_gather?.toString() || '0'} />
      ),
    }
  ];

  // 根据债券列表动态添加列
  const bondColumns = bonds.map((bond) => {
    console.log(`为债券 ${bond.name} (ID: ${bond.id}) 创建列`);
    return {
      field: `bond_${bond.id}`, // 对应扁平化数据中的属性名
      headerName: `${bond.name} (${bond.type_string})`,
      minWidth: 150,
      flex: 1,
      renderCell: (params: any) => {
        // 直接从扁平化数据中读取值
        const bondPurchaseValue = params.row[`bond_${bond.id}`] || 0;
        return params.row.is_divider ? ' ' : <CellWithTooltipCopy value={bondPurchaseValue.toString()} />;
      },
    };
  });

  // 合并基础列和动态债券列
  setColumns([...baseColumns, ...bondColumns]);
  console.log('列组合完成，共', baseColumns.length + bondColumns.length, '列');
}  // 使用普通函数而非useCallback

// 获取可切换显示的列
const getTogglableColumns = useCallback(() => {
  return columns
    .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
    .map((column) => column.field);
}, [columns]);

// 初始化时获取债券列表和数据
useEffect(() => {
  // 先获取债券列表，然后才获取购买数据
  const initData = async (): Promise<void> => {
    try {
      console.log('页面初始化，获取债券列表...');
      // 首先获取债券列表，只会获取一次
      const bondResult = await fetchBondData();
      
      // 只有当成功获取债券列表后，才继续获取购买数据
      if (bondResult && bondResult.length > 0) {
        console.log('债券数据加载成功，开始获取购买数据...');
        await getList();
      } else {
        console.warn('债券数据为空，无法获取购买数据');
        // toast.error('未能获取到债券信息，请刷新页面重试');
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
      toast.error('初始化数据失败，请刷新页面重试');
    }
  };
  
  initData();
}, []); // 不添加任何依赖项，确保只在组件挂载时运行一次

// 通过useRef跟踪过滤条件的变化
const prevFiltersRef = useRef({
  start: filters.state.created_at_start,
  end: filters.state.created_at_end
});

// 当过滤条件变化时，重新获取数据
useEffect(() => {
  // 只在初始化之后才响应过滤条件变化
  if (filters.state.created_at_start !== null && filters.state.created_at_end !== null && bonds.length > 0) {
    // 检查过滤条件是否真正变化
    const prevStart = prevFiltersRef.current.start;
    const prevEnd = prevFiltersRef.current.end;
    const currentStart = filters.state.created_at_start;
    const currentEnd = filters.state.created_at_end;
    
    // 只在实际变化时才调用
    if (prevStart !== currentStart || prevEnd !== currentEnd) {
      console.log('过滤条件真正变化，加载数据');
      // 更新跟踪的值
      prevFiltersRef.current = {
        start: currentStart,
        end: currentEnd
      };
      // 直接调用原始函数避免依赖getList
      getListOriginal();
    }
  }
}, [filters.state.created_at_start, filters.state.created_at_end, bonds.length, getListOriginal]);

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

  // 从此处移除了处理单个用户查询和会员编码的函数

  // 条件筛选处理
  const handleFilterData = useCallback(async (forceRefresh: boolean = false) => {
    toast.info('正在查询...');
    
    // 验证时间条件
    if (filtersForEdit.state.created_at_start && filtersForEdit.state.created_at_end) {
      // 日期有效性验证
      if (filtersForEdit.state.created_at_start.isAfter(filtersForEdit.state.created_at_end)) {
        toast.error('开始时间不能晚于结束时间');
        return;
      }
    }
    
    // 更新筛选状态
    const cloneState = { ...filters.state };
    
    // 处理时间
    if (filtersForEdit.state.created_at_start) {
      cloneState.created_at_start = filtersForEdit.state.created_at_start.unix();
    }
    if (filtersForEdit.state.created_at_end) {
      cloneState.created_at_end = filtersForEdit.state.created_at_end.unix();
    }
    
    // 同步购买方式参数
    cloneState.purchase_method = filtersForEdit.state.purchase_method as 0 | 1 | 2;
    
    // 将条件更新到filters中，用于API查询
    filters.setState(cloneState);
    console.log('filters.state', filters.state);
    
    // 如果是强制刷新，直接调用原始函数，跳过防抖
    if (forceRefresh) {
      console.log('强制刷新，直接调用');
      await getListOriginal(true);
    } else {
      // 普通查询使用防抖版本
      console.log('普通查询，使用防抖');
      getList(false);
    }
  }, [filters, filtersForEdit.state, getList, getListOriginal]);

  // 日期选择器应用时的处理函数
  const handleApply = useCallback((start: IDatePickerControl, end: IDatePickerControl) => {
    // 父组件接收到用户选择的数据
    filtersForEdit.setState({ created_at_start: start, created_at_end: end });
    // 更新有效日期范围
    setLastValidDateRange({ start, end });
    console.log('Selected start date:', start?.format('YYYY-MM-DD') || 'null');
    console.log('Selected end date:', end?.format('YYYY-MM-DD') || 'null');
  }, [filtersForEdit, setLastValidDateRange]);

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit]
  );

  // 处理社区名称过滤
  const handleFilterCommunityName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ community_name: event.target.value });
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

  const handleFilterBondID = useCallback(
    (event: SelectChangeEvent<string | number>) => {
      const value = event.target.value;
      // If value is empty string, set to undefined, otherwise convert to number
      filtersForEdit.setState({ bond_id: value === '' ? undefined : Number(value) });
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

  // 自定义工具栏 - 修正类型定义
  const CustomToolbar = useCallback(() => {
    // 每次工具栏渲染时生成最新的文件名
    const currentFileName = `社区债券购买汇总${getFilenameDateSuffix()}`;
    console.log('当前导出文件名:', currentFileName);
    
    return (
      <GridToolbarContainer>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={1} 
          alignItems={{ xs: 'flex-start', sm: 'center' }} 
          justifyContent="space-between" 
          width="100%"
          padding="8px"
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            {/* 导出按钮 */}
            <GridToolbarExport 
              printOptions={{ 
                disableToolbarButton: true 
              }}
              csvOptions={{ 
                fileName: currentFileName,
                allColumns: true,
              }} 
            />
            
            {/* 显示全部债券列按钮已屏蔽 */}
          </Stack>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            共 {totalCount} 条记录
          </Typography>
        </Stack>
      </GridToolbarContainer>
    );
  }, [totalCount, getFilenameDateSuffix]);

  // 确保函数返回JSX Element类型
  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="社区债券购买汇总"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '会员', href: paths.dashboard.user.root },
            { name: '社区债券购买汇总' },
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

            {/* 添加社区名称输入框 */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.community_name}
                onChange={handleFilterCommunityName}
                placeholder="请输入社区名称"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="mdi:office-building" sx={{ color: 'text.disabled' }} />
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

            {/* 会员编码输入框已移除 */}

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

            {/* 单个用户查询复选框已移除 */}

            <Stack direction="row" spacing={1}>
              <FormControl component="fieldset" sx={{ flexShrink: 1 }}>
                <Button variant="contained" onClick={() => handleFilterData(false)}>
                  查询
                </Button>
              </FormControl>
              
              <FormControl component="fieldset" sx={{ flexShrink: 1 }}>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => handleFilterData(true)}
                  startIcon={<Iconify icon="mdi:refresh" />}
                >
                  刷新
                </Button>
              </FormControl>
              {/* 债券列按钮已屏蔽 */}
            </Stack>
          </Stack>

          {/* 数据表格，采用客户端管理数据模式 */}
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={filteredData}
            columns={columns}
            loading={usersLoading}
            
            sortingMode="client" // 客户端排序
            filterMode="client" // 客户端过滤模式
            
            paginationMode="client" // 客户端分页
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            
            slotProps={{
              // 性能优化，减少不必要的重渲染
              baseButton: {
                variant: 'outlined'
              }
            }}
            
            onStateChange={useCallback((state: any) => {
              // 使用防抖函数处理状态变化，减少频繁更新
              if (bonds.length > 0 && columns.length <= 3) {
                const debounceTimeout = setTimeout(() => {
                  console.log('检测到列可能没有正确加载，重新尝试...');
                  composeColumns();
                }, 300);
                
                return () => clearTimeout(debounceTimeout);
              }
            }, [bonds.length, columns.length, composeColumns])}

            sx={useMemo(() => ({
              '.MuiDataGrid-row': {
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.lighter, 0.08),
                }
              },
              // 减少不必要的渲染
              '.MuiDataGrid-cell': {
                py: 1,
              }
            }), [theme.palette.primary.lighter])}

            // 显示密度切换器
            density="standard"
            slots={useMemo(() => ({
              toolbar: CustomToolbar,
              noRowsOverlay: () => <EmptyContent title="暂无数据" sx={{ height: '100%' }} />,
              noResultsOverlay: () => <EmptyContent title="无匹配结果" sx={{ height: '100%' }} />,
            }), [CustomToolbar])}
          />
        </Card>
      </DashboardContent>

    </>
  );
}
