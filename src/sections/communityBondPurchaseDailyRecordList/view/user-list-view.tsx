import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { toast } from 'sonner';

import {
  CommunityBondPurchaseDayListRequest,
  getCommunityBondPurchaseDayList,
} from 'src/api/announcement';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { FormControl, InputAdornment, TextField } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import dayjs from 'dayjs';
import { CellWithTooltipCopy } from '../user-table-cell';

// 时间戳工具函数
const toMilliseconds = (seconds: number) => seconds * 1000;
const toSeconds = (milliseconds: number) => Math.floor(milliseconds / 1000);
const getCurrentSeconds = () => Math.floor(Date.now() / 1000);
// ----------------------------------------------------------------------

export function CommunityBondPurchaseDailyRecordListView() {
  const theme = useTheme();

  // loading状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 分页参数
  const [issue, setIssue] = useState(dayjs(new Date().setDate(new Date().getDate() - 1)).format('YYYY-MM-DD'));
  const [orderDirection, setOrderDirection] = useState<'asc' | 'desc'>('asc');
  const [memberAddress, setMemberAddress] = useState('');
  const [orderField, setOrderField] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 列表数据
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // 获取公告列表
  const fetchAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = {
        page: page + 1,
        page_size: pageSize,
      } as CommunityBondPurchaseDayListRequest;

      if (issue) {
        params.issue = issue;
      }
      if (memberAddress) {
        params.member_address = memberAddress;
      }
      if (orderDirection) {
        params.order_direction = orderDirection;
      }
      if (orderField) {
        params.order_field = orderField;
      }

      const response = await getCommunityBondPurchaseDayList(params);

      if (response.data?.list) {
        setAnnouncements(response.data.list);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('获取列表失败:', error);
      toast.error('获取列表失败');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, issue, memberAddress, orderDirection]);

  // 首次加载和分页变化时获取数据
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  // 表格列定义
  const columns: GridColDef<any, any, any>[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 100,
    },
    {
      field: 'issue',
      headerName: '期数',
      flex: 2,
    },
    {
      field: 'member_address',
      headerName: '地址',
      flex: 2,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member_address} />,
    },
    {
      field: 'purchase_amount',
      headerName: '购买数量(USDT)',
      flex: 2,
    },
  ];

  return (
    <>
      <Box
        sx={{
          p: theme.spacing(3),
        }}
      >
        <CustomBreadcrumbs
          heading="社区债券购买记录"
          links={[{ name: '首页' }, { name: '社区债券购买记录' }]}
          sx={{ mb: 3 }}
        />

        <Card>
          <Stack
            spacing={1}
            alignItems={{ xs: 'flex-end', md: 'center' }}
            sx={{ p: { xs: 2, md: 2 }, pb: 0 }}
            direction={{ xs: 'column', md: 'row' }}
          >
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 300 } }}>
              <TextField
                fullWidth
                disabled={isLoading}
                value={memberAddress}
                onChange={(e) => setMemberAddress(e.target.value)}
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

            {/* 选择单个日期选择  */}
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <DateTimePicker
                disabled={isLoading}
                value={dayjs(issue)}
                viewRenderers={{
                  hours: null,
                  minutes: null,
                  seconds: null,
                }}
                onChange={(value) => setIssue(value?.format('YYYY-MM-DD') || '')}
              />
            </FormControl>

            <FormControl   component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button disabled={isLoading}  variant="contained" onClick={fetchAnnouncements}>
                查询
              </Button>
            </FormControl>
          </Stack>
          <DataGrid<any>
            sortingMode="server" 
            rows={announcements}
            columns={columns}
            rowCount={total}
            loading={isLoading}
            pageSizeOptions={[10, 20, 50]}
            paginationModel={{ page, pageSize }}
            paginationMode="server"
            onSortModelChange={(e) => {
               const [firstItem] = e;
               if (firstItem) {
                 setOrderDirection(firstItem.sort as 'asc' | 'desc');
                 setOrderField(firstItem.field);
               } else {
                 setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
               }
            }}
           
            onPaginationModelChange={({ page: newPage, pageSize: newPageSize }) => {
              handlePageChange(newPage);
              if (newPageSize !== pageSize) {
                handlePageSizeChange(newPageSize);
              }
            }}
            disableRowSelectionOnClick
            sx={{ minHeight: 400 }}
          />
        </Card>
      </Box>
    </>
  );
}
