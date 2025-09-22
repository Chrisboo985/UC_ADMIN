/* eslint-disable */

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
import Typography from '@mui/material/Typography';
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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import InputLabel from '@mui/material/InputLabel';
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
import { fNumberWithSeparator } from 'src/utils/format-number';
import { DashboardContent } from 'src/layouts/dashboard';

import {
  getProductList,
  type GetProductListResponse,
  getOrderListAPI,
  type OrderListRequest
} from 'src/api/user';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import React from 'react'
import { axiosForApi } from 'src/utils/axios';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];


type Row = any;

// 用户列表视图主组件
export function NodeOrderListView(props: { h: boolean }) {
  const [productList, setProductList] = React.useState<GetProductListResponse>([])
  const { h: advancedUserListPage } = props;

  const theme = useTheme();

  const confirm = useBoolean();

  const filters = useSetState<OrderListRequest>({
    member_address: '',
    created_at_end: undefined,
    created_at_start: undefined,
    page: 1,
    page_size: 10,
    product_id: undefined
  });

  const filtersForEdit = useSetState<{
    member_address?: string;
    created_at_end?: number;
    created_at_start?: number;
    product_id?: number;
  }>({
    member_address: '',
    created_at_end: undefined,
    created_at_start: undefined,
    product_id: undefined,
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
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);
  // 分页
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });

  const [totalPurchase, setTotalPurchase] = useState<number | string>(0);

  const [usersLoading, setUsersLoading] = useState<true | false>(false);

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.member_address || !!filtersForEdit.state.product_id || !!filtersForEdit.state.created_at_start || !!filtersForEdit.state.created_at_end;


  const handleProductFilter = React.useCallback(
    (id: number) => {
      filtersForEdit.setState({ product_id: id });
    },
    [filtersForEdit]
  )

  // 处理开始时间变化
  const handleStartDateChange = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      filtersForEdit.setState({
        created_at_start: newValue ? newValue.unix() : undefined
      });
    },
    [filtersForEdit]
  );

  // 处理结束时间变化
  const handleEndDateChange = useCallback(
    (newValue: dayjs.Dayjs | null) => {
      filtersForEdit.setState({
        created_at_end: newValue ? newValue.unix() : undefined
      });
    },
    [filtersForEdit]
  );

  // 获取用户列表
  const getList = useCallback(async () => {
    const params = {
      ...filters.state,
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setUsersLoading(true);
    await getOrderListAPI(params)
      .then((apiResult) => {
        const { data, code } = apiResult;
        if (code === 0) {
          setTotalPurchase(data?.total_purchase)
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
    filters.setState({
      ...filters.state,
      member_address: filtersForEdit.state.member_address,
      created_at_end: filtersForEdit.state.created_at_end,
      created_at_start: filtersForEdit.state.created_at_start,
      product_id: filtersForEdit.state.product_id,
    });
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ member_address: event.target.value });
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

  // const CustomToolbarCallback = useCallback(
  //   () => (
  //     <CustomToolbar
  //       canReset={canReset}
  //       filtersForEdit={memoizedFiltersForEdit}
  //       selectedRowIds={selectedRowIds}
  //       setFilterButtonEl={setFilterButtonEl}
  //       filteredResults={filteredData.length}
  //     />
  //   ),
  //   [
  //     canReset,
  //     memoizedFiltersForEdit,
  //     selectedRowIds,
  //     filteredData,
  //     setFilterButtonEl,
  //   ]
  // );

  const columns: GridColDef[] = [
    {
      field: 'member_id',
      headerName: '会员ID',
      minWidth: 80,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member_id || '-'} />,
    },
    {
      field: 'member.address',
      headerName: '用户地址',
      minWidth: 300,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member.address || '-'} />,
    },
    {
      field: 'hash',
      headerName: '订单哈希',
      minWidth: 300,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.hash || '-'} />,
    },
    {
      field: 'product.name',
      headerName: '产品名称',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.product.name || '-'} />,
    },
    {
      field: 'price',
      headerName: '产品价格',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.price || '-'} />,
    },
    {
      field: 'quantity',
      headerName: '购买数量',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={String(params.row.quantity ?? '-')} />,
    },
    {
      field: 'amount',
      headerName: '购买总金额',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={String(params.row.amount ?? '-')} />,
    },
    {
      field: 'power',
      headerName: '算力',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={String(params.row.power ?? '-')} />,
    },
    {
      field: 'withdraw_limit',
      headerName: '提现限制',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={String(params.row.withdraw_limit ?? '-')} />,
    },
    // {
    //   field: 'price',
    //   headerName: '价格',
    //   minWidth: 170,
    //   renderCell: (params) => <CellWithTooltipCopy value={String(params.row.price ?? '-')} />,
    // },
    {
      field: 'tx_at',
      headerName: '交易时间',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={dayjs(params.row.tx_at * 1000).format('YYYY-MM-DD HH:mm:ss') || '-'} />,
    },
    {
      field: 'created_at_string',
      headerName: '创建时间',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.created_at_string || '-'} />,
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);


  React.useEffect(
    () => {
      ~(async () => {
        try {
          const res = await getProductList()

          const { code, data } = res

          if (code !== 0) return
          setProductList(data)
        } catch (error) { }
      })()
    },
    []
  )


  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="认购记录列表"
          links={[
            { name: '财务控制台' },
            { name: '认购记录列表' },
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
              <InputLabel id="member-type-select-labe">请选择产品</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={filtersForEdit.state.product_id}
                label="Age"
                onChange={(e) => handleProductFilter(e.target.value as number)}
              >
                <MenuItem value={Infinity}>全部</MenuItem>
                {
                  productList.map(({ id, name, price }) => (
                    <MenuItem key={id} value={id}>
                      {name}
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <FormControl component="fieldset" sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 200 },
              maxWidth: { xs: '100%', md: 200 }
            }}>
              <DateTimePicker
                label="开始时间"
                value={filtersForEdit.state.created_at_start ? dayjs.unix(filtersForEdit.state.created_at_start) : null}
                onChange={handleStartDateChange}
                timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                format="YYYY-MM-DD HH:mm"
                slotProps={{
                  textField: {
                    size: 'medium',
                    fullWidth: true
                  }
                }}
              />
            </FormControl>

            {/* 结束时间选择器 */}
            <FormControl component="fieldset" sx={{
              flexShrink: 0,
              width: { xs: '100%', md: 200 },
              maxWidth: { xs: '100%', md: 200 }
            }}>
              <DateTimePicker
                label="结束时间"
                value={filtersForEdit.state.created_at_end ? dayjs.unix(filtersForEdit.state.created_at_end) : null}
                onChange={handleEndDateChange}
                format="YYYY-MM-DD HH:mm"
                timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                slotProps={{
                  textField: {
                    size: 'medium',
                    fullWidth: true
                  }
                }}
              />
            </FormControl>
            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <Button variant="contained" onClick={handleFilterData}>
                查询
              </Button>
            </FormControl>
          </Stack>
          <Box sx={{ px: 2, py: 2 }}>
            <Stack direction="row" spacing={3} divider={<Box sx={{ height: '60px', borderLeft: 1, borderColor: 'divider' }} />}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">总购买金额 (USD1)</Typography>
                <Typography variant="h6">{fNumberWithSeparator(totalPurchase,2)}</Typography>
              </Stack>
            </Stack>
          </Box>

          {/* 数据表格，采用服务端管理数据模式 */}
          <DataGrid
            checkboxSelection={false}
            disableRowSelectionOnClick
            disableColumnSorting
            rows={filteredData}
            columns={columns}
            loading={usersLoading}
            pageSizeOptions={[10, 20, 50]}
            pagination
            sortingMode="server"
            filterMode="client"
            paginationMode="server"
            onPaginationModelChange={(model) => {
              setPagination({ page: model.page + 1, pageSize: model.pageSize });
            }}
            rowCount={totalCount}
            paginationModel={{ page: pagination.page - 1, pageSize: pagination.pageSize }}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            // slots={{
            //   toolbar: CustomToolbarCallback as GridSlots['toolbar'],
            //   noResultsOverlay: () => <EmptyContent title="返回数据为空" />,
            // }}
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
// interface CustomToolbarProps {
//   canReset: boolean;
//   filteredResults: number;
//   selectedRowIds: GridRowSelectionModel;
//   filtersForEdit: any;
//   setFilterButtonEl: React.Dispatch<React.SetStateAction<HTMLButtonElement | null>>;
// }

// function CustomToolbar({
//   filtersForEdit,
//   canReset,
//   selectedRowIds,
//   filteredResults,
//   setFilterButtonEl,
// }: CustomToolbarProps) {
//   return (
//     <>
//       <GridToolbarContainer>
//         <Stack
//           spacing={1}
//           flexGrow={1}
//           direction="row"
//           alignItems="center"
//           justifyContent="flex-end"
//         >
//           <GridToolbarColumnsButton />
//           <GridToolbarFilterButton ref={setFilterButtonEl} />
//           <GridToolbarExport />
//         </Stack>
//       </GridToolbarContainer>
//       {canReset && (
//         <UserTableFiltersResult filters={filtersForEdit} totalResults={0} sx={{ p: 2.5, pt: 0 }} />
//       )}
//     </>
//   );
// }