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
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
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
import { getBondPurchaseDataAPI } from 'src/api/finance';
import { getBondIndexAPI, BondData } from 'src/api/lgns';

import { toast } from 'src/components/snackbar';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AppWidgetSummary } from 'src/sections/lgns/app/app-widget-summary';

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 销售记录视图主组件
export function BondSalesRecordsView() {
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();
  const theme = useTheme();

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

  // 列表数据
  const [tableData, setTableData] = useState<ModelsBondPurchase & Bond[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ModelsBondPurchase & Bond[]>([]);
  // 总计
  const [totalCount, setTotalCount] = useState<number>(0);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  // 分页
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  // 筛选按钮元素
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  // 债券列表
  const [bonds, setBonds] = useState<BondData[]>([]);

  const [widgetData, setWidgetData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  // 筛选条件是否能够重置
  const canReset =
    !!filtersForEdit.state.bond_id ||
    !!filtersForEdit.state.member_id ||
    !!filtersForEdit.state.member_address ||
    !!filtersForEdit.state.created_at_end ||
    !!filtersForEdit.state.created_at_start;

  const getList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBondPurchaseDataAPI({
        ...filters.state,
        page: pagination.page,
        page_size: pagination.pageSize,
      });
      console.log('response获取列表', response);
      if (response.data) {
        console.log('查看数据', response.data);
        // 将数据组织为widget格式
        setWidgetData({
          KSPData: [
            {
              title: '债券销售总额',
              total: response.data?.KSP?.bond_tatol || 0,
              unit: 'KSP',
              color: 'primary',
            },
            {
              title: '本月新增销售',
              total: response.data?.KSP?.month_bond || 0,
              unit: 'KSP',
              color: 'secondary',
            },
            {
              title: '今日新增销售',
              total: response.data?.KSP?.today_bond || 0,
              unit: 'KSP',
              color: 'success',
            },
            {
              title: '本周新增销售',
              total: response.data?.KSP?.week_bond || 0,
              unit: 'KSP',
              color: 'info',
            },
          ],
          USDTData: [
            {
              title: '债券销售总额',
              total: response.data?.USDT?.bond_tatol || 0,
              unit: 'USDT',
              color: 'primary',
            },
            {
              title: '本月新增销售',
              total: response.data?.USDT?.month_bond || 0,
              unit: 'USDT',
              color: 'secondary',
            },
            {
              title: '今日新增销售',
              total: response.data?.USDT?.today_bond || 0,
              unit: 'USDT',
              color: 'success',
            },
            {
              title: '本周新增销售',
              total: response.data?.USDT?.week_bond || 0,
              unit: 'USDT',
              color: 'info',
            },
          ],
        });
      }
    } catch (error) {
      console.log('列表获取失败', error);
      toast.error('列表获取失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.pageSize, filters.state]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选', filtersForEdit);

    filters.setState({
      member_address: filtersForEdit.state.member_address || undefined,
      created_at_end: filtersForEdit.state.created_at_end
        ? dayjs(filtersForEdit.state.created_at_end).unix()
        : 0,
      created_at_start: filtersForEdit.state.created_at_start
        ? dayjs(filtersForEdit.state.created_at_start).unix()
        : 0,
      purchase_method: filtersForEdit.state.purchase_method || 0, // 添加购买方式参数
    });
  };

  const handleFilterMemberAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ member_address: event.target.value });
    },
    [filtersForEdit.setState]
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
          heading="债券销售记录"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '财务控制台', href: paths.dashboard.financialConsole.root },
            { name: '债券销售记录' },
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

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>
          {/* 债券销售数据概览 */}
          {!loading && (
            <>
              {Object.entries(widgetData).map(([category, widgets], index) => {
                // 添加类目名称映射
                const categoryNameMap: Record<string, string> = {
                  KSPData: 'KSN 债券销售数据',
                  USDTData: 'USDT 债券销售数据',
                };

                return (
                  <Box key={index} sx={{ p: { xs: 2, md: 2 }, mb: 4 }}>
                    <Box sx={{ typography: 'subtitle1', mb: 1 }}>
                      {categoryNameMap[category] || category}
                    </Box>

                    <Grid container spacing={3}>
                      {widgets.map((widget, widgetIndex) => (
                        <Grid xs={12} sm={6} md={3} key={widgetIndex}>
                          <AppWidgetSummary
                            title={widget.title}
                            percent={0}
                            total={round(Number(widget.total), 4)}
                            unit={widget.unit}
                            chart={{
                              colors: [(theme.palette as any)[widget.color].main],
                              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                              series: [
                                Math.random() * 10,
                                Math.random() * 10,
                                Math.random() * 10,
                                Math.random() * 10,
                                Math.random() * 10,
                                Math.random() * 10,
                                Math.random() * 10,
                                Math.random() * 10,
                              ],
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </>
          )}
        </Card>
      </DashboardContent>
    </>
  );
}
