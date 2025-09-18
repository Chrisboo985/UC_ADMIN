import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

import { useTheme } from '@mui/material/styles';
import { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { useSetState } from 'src/hooks/use-set-state';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';

import { DashboardContent } from 'src/layouts/dashboard';
import { CellWithTooltipCopy } from '../user-table-cell';
import React from 'react'
import { getRechargeList } from 'src/api/user';
import { type RechargeListItem, type RechargeListParams } from './recharge-list-view.types'
import type { Theme, SxProps } from '@mui/material/styles';
import dayjs from 'dayjs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { useBoolean } from 'src/hooks/use-boolean';
import type { IDatePickerControl } from 'src/types/common';
import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  filters: any;
};

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function RechargeListView(props: { h: boolean }) {
  const { h: advancedUserListPage } = props;
  const openDateRange = useBoolean();

  const theme = useTheme();

  const params = useSetState<RechargeListParams>({
    member_address: '',
    created_at_start: null,
    created_at_end: null,
    page: 1,
    page_size: 10
  })

  // 过滤数据
  const [filteredData, setFilteredData] = useState<RechargeListItem[]>([]);
  // 总计
  const [totalCount, setTotalCount] = useState<number>(0);
  // 当前选中ID
  const [selectedRowIds, setSelectedRowIds] = useState<GridRowSelectionModel>([]);
  // 筛选按钮元素
  const [filterButtonEl, setFilterButtonEl] = useState<HTMLButtonElement | null>(null);
  // 列显示模式
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>(HIDE_COLUMNS);

  const [usersLoading, setUsersLoading] = useState<true | false>(false);
  // 筛选条件是否能够重置
  const canReset = !!params.state.member_address || !!params.state.created_at_start || !!params.state.created_at_end;


  // 获取用户列表
  const getList = useCallback(async () => {
    setUsersLoading(true);
    getRechargeList(params.state)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          // 如果为空，需要设置默认值
          setFilteredData((data?.list || []));
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
  }, [params.state]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    const { member_address, created_at_start, created_at_end } = params.state

    // 只保留接口支持的搜索参数
    params.setState({
      member_address: member_address,
      created_at_start: created_at_start ?? null ,
      created_at_end: created_at_end ?? null
    });
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      params.setState({ member_address: event.target.value });
    },
    [params] // Include params in dependencies
  );

  const memoizedFiltersForEdit = useMemo(
    () => ({
      state: params.state,
      setState: params.setState,
    }),
    [params.setState, params.state]
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

  const columns: GridColDef[] = [
    {
      field: 'address',
      headerName: '地址 ',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.address || '-'} />,
    },
    {
      field: 'deposit_address',
      headerName: '充值地址',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.deposit_address || '-'} />,
    },
    {
      field: 'amount',
      headerName: '充值金额',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.amount || '-'} />,
    },
    {
      field: 'transaction_hash',
      headerName: '交易哈希',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.transaction_hash || '-'} />,
    },
    {
      field: 'created_at_string',
      headerName: '交易时间',
      minWidth: 200,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.created_at_string || '-'} />,
    },
    {
      field: 'chain_id',
      headerName: '链ID',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.chain_id || '-'} />,
    },
    {
      field: 'token_id',
      headerName: '代币ID',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.token_id || '-'} />,
    },
    {
      field: 'remark',
      headerName: '备注',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.remark || '-'} />,
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const handleApply = (start: IDatePickerControl, end: IDatePickerControl) => {
    // 父组件接收到用户选择的数据

    params.setState({ created_at_start: start?.unix() || null, created_at_end: end?.unix() || null });
    console.log('Selected start date:', start?.format('YYYY-MM-DD'));
    console.log('Selected end date:', end?.format('YYYY-MM-DD'));
  };

  const dateError = fIsAfter(
    params.state.created_at_start,
    params.state.created_at_end
  );

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="充值列表"
          links={[
            { name: '管理',
              // href: paths.dashboard.root
            },
            { name: '充值',
              // href: paths.dashboard.log.root
            },
            { name: '充值列表' },
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
                value={params.state.member_address}
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
                  !!params.state.created_at_start && !!params.state.created_at_end ?
                    `${ dayjs.unix(params.state.created_at_start).format('YYYY-MM-DD HH:mm') } - ${ dayjs.unix(params.state.created_at_end).format('YYYY-MM-DD HH:mm') }` :
                    '选择充值日期'
                }
              </Button>
              <CustomDateRangePicker
                variant="input"
                startDate={ params.state.created_at_start ? dayjs.unix(params.state.created_at_start) : null}
                endDate={ params.state.created_at_end ? dayjs.unix(params.state.created_at_end) : null }
                open={openDateRange.value}
                onClose={openDateRange.onFalse}
                onApply={handleApply}
                selected={
                  !!params.state.created_at_start && !!params.state.created_at_end
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
              params.setState({ page: model.page + 1, page_size: model.pageSize });
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
            paginationModel={{ page: params.state.page - 1, pageSize: params.state.page_size }}
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

export function UserTableFiltersResult({ filters, totalResults, sx }: Props) {
  const handleRemoveAddress = useCallback(() => {
    filters.setState({ member_address: '' });
  }, [filters]);

  const handleRemoveRechargeTime = useCallback(() => {
    filters.setState({ created_at_start: null, created_at_end: null });
  }, [filters])

  const handleReset = useCallback(() => {
    filters.setState({ member_address: '', created_at_start: null, created_at_end: null });
  }, [filters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
    <FiltersBlock label="地址:" isShow={!!filters.state.member_address}>
      <Chip {...chipProps} label={filters.state.member_address} onDelete={handleRemoveAddress} />
    </FiltersBlock>
      <FiltersBlock label="充值时间:" isShow={!!filters.state.created_at_start && !!filters.state.created_at_end }>
        <Chip
          {...chipProps}
          label={`${ dayjs.unix(filters.state.created_at_start).format('YYYY-MM-DD HH:mm:ss') } - ${ dayjs.unix(filters.state.created_at_end).format('YYYY-MM-DD HH:mm:ss') }`}
          onDelete={ handleRemoveRechargeTime }
        />
      </FiltersBlock>
    </FiltersResult>
  );
}

function CustomToolbar({
  filtersForEdit,
  canReset,
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
