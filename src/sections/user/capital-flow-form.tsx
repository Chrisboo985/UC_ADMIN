import { z as zod } from 'zod';
import { useCallback, useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  fundAssetFlowAPI,
  type FundAssetFlowRequest,
  type FundAssetFlowItem,
  type FundAssetFlowResponse
} from 'src/api/user';
import { useSetState } from 'src/hooks/use-set-state';
import Box from '@mui/material/Box';
import { toast } from 'src/components/snackbar';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { DataGrid } from '@mui/x-data-grid';
import { FormControlLabel, IconButton, TextField, Typography, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { handleLoop } from 'src/layouts/components/searchbar/utils';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// 资金流水类型选项
const FLOW_TYPE_OPTIONS = [
  { value: 'hp', label: 'HP' },
  { value: 'tp', label: 'TP' },
  { value: 'up', label: 'UP' },
  { value: 'bp', label: 'BP' },
  { value: 'cp', label: 'CP' },
  { value: 'rp', label: 'RP' },
  { value: 'mc', label: 'MC' },
  { value: 'apd', label: 'APD' },
  { value: 'wapd', label: 'WAPD' },
  { value: 'xapd', label: 'XAPD' },
];

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  currentUser: { id: number;[key: string]: any };
  type: string | number;
};

export function CapitalFlowForm({ open, onClose, currentUser, type }: Props) {
  const methods = useForm<FundAssetFlowRequest>({
    mode: 'all',
    defaultValues: {
      id: currentUser?.id || 0,
      date: '',
      page: 1,
      page_size: 10,
      type: String(type || ''),
    },
  });

  // 获取当前日期的YYYY-MM-DD格式
  const getCurrentDateYYYYMMDD = () => {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filters = useSetState({
    date: getCurrentDateYYYYMMDD(),
    id: currentUser?.id || 0,
    page: 1,
    page_size: 10,
    type: String(type || ''),
  });

  if (!open) return null;
  // 过滤数据
  const [filteredData, setFilteredData] = useState<FundAssetFlowItem[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  // 分页
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const [totalCount, setTotalCount] = useState<number>(0);

  // 事件类型映射
  const EVENT_TYPE_MAP: Record<string, string> = {
    'integral_convert': '积分兑换',
    'integral_business': 'CP商家消费', 
    'integral_polymerize': '聚合转账',
    'level_up_reward': '晋级奖',
    'forwarder': 'USDT充值兑换TP',
    'chain_apd': 'WAPD/APD积分提链上APD代币',
    'T1': '新增极差',
    'T2': '新增代数', 
    'T3': '挖矿极差',
    'T4': '挖矿代数',
    'T5': '挖矿静态收益',
    'T6': 'TP补贴',
  };

  // 获取事件类型显示名称
  const getEventTypeName = (event: string) => {
    return EVENT_TYPE_MAP[event] || event;
  };

  const columns = [
    { field: 'type', headerName: '类型', width: 80 },
    { 
      field: 'event', 
      headerName: '事件', 
      width: 150,
      renderCell: (params: any) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {getEventTypeName(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.value}
          </Typography>
        </Box>
      )
    },
    { field: 'event_table', headerName: '事件表', width: 120 },
    { field: 'before', headerName: '变动前', width: 120 },
    { field: 'after', headerName: '变动后', width: 120 },
    { 
      field: 'change', 
      headerName: '变动值', 
      width: 100,
      renderCell: (params: any) => (
        <Typography 
          variant="body2" 
          sx={{ 
            color: params.value > 0 ? 'success.main' : params.value < 0 ? 'error.main' : 'text.primary',
            fontWeight: 500
          }}
        >
          {params.value > 0 ? '+' : ''}{params.value}
        </Typography>
      )
    },
    { field: 'hash', headerName: '交易Hash', width: 150 },
    { field: 'remark', headerName: '备注', width: 150 },
    { field: 'created_at_string', headerName: '创建时间', width: 180 },
  ];
  // 获取用户列表
  const getList = useCallback(async () => {
    const params: FundAssetFlowRequest = {
      type: filters.state.type,
      date: filters.state.date,
      id: currentUser?.id || 0,
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setUsersLoading(true);
    await fundAssetFlowAPI(params)
      .then((apiResult) => {
        const { data, code } = apiResult;
        if (code === 0 && data) {
          // 如果为空，需要设置默认值
          setFilteredData(data?.list || []);
          setTotalCount(data?.total || 0);
        } else {
          toast.error(apiResult.message || '获取资金流水失败');
          setFilteredData([]);
          setTotalCount(0);
        }
      })
      .catch((error) => {
        toast.error('查询失败，请稍后再试');
        setFilteredData([]);
        setTotalCount(0);
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, [
    pagination.page,
    pagination.pageSize,
    filters.state,
    currentUser?.id,
    type,
  ]);
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);
  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据
  // 时间戳工具函数
  const toMilliseconds = (seconds: number) => seconds * 1000;
  const toSeconds = (milliseconds: number) => Math.floor(milliseconds / 1000);
  const getCurrentSeconds = () => Math.floor(Date.now() / 1000);

  // 公告数据类型
  type Announcement = {
    date: string;
  }
  // 表单数据
  const [formData, setFormData] = useState();
  // loading状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <>
      <DialogTitle sx={{ minHeight: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        资金流水
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* <Form methods={methods} onSubmit={onSubmit}> */}
        <Box sx={{ my: 2, display: 'flex', gap: 2 }}>
          <TextField
            label="查询日期"
            type="date"
            value={filters.state.date}
            onChange={(e) => {
              const selectedDate = e.target.value; // 已经是 YYYY-MM-DD 格式
              filters.setState({ date: selectedDate });
            }}
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          />
          <FormControl sx={{ flex: 1, minWidth: 200 }}>
            <InputLabel>流水类型</InputLabel>
            <Select
              value={filters.state.type}
              label="流水类型"
              onChange={(e) => {
                filters.setState({ type: e.target.value });
              }}
              disabled={isSubmitting}
            >
              {FLOW_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Scrollbar sx={{ pt: 2 }}>
          <DataGrid
            columns={columns}
            rows={filteredData}
            checkboxSelection
            disableRowSelectionOnClick
            loading={usersLoading}
            rowCount={totalCount}
            pageSizeOptions={[10, 20, 50]}
            pagination
            sortingMode="server"
            filterMode="client"
            paginationMode="server"
            paginationModel={{ page: pagination.page - 1, pageSize: pagination.pageSize }}
            onPaginationModelChange={(model) => {
              console.log('更改页面列表', model);
              // fetch data from server
              setPagination({ page: model.page + 1, pageSize: model.pageSize });
            }}
            sx={{
              minHeight: 400,
              '& .MuiDataGrid-main': {
                minHeight: 400,
              },
            }}
          >
          </DataGrid>
        </Scrollbar>

        <DialogActions sx={{ flexShrink: 0, mt: 3 }}>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            关闭
          </Button>
        </DialogActions>
        {/* </Form> */}
      </DialogContent>
    </>
  );
}
