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
import { getCommunityRewardsList } from 'src/api/user';
import { type Item, type Prams } from './user-list-view.types'
import type { Theme, SxProps } from '@mui/material/styles';
import dayjs from 'dayjs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { useBoolean } from 'src/hooks/use-boolean';
import type { IDatePickerControl } from 'src/types/common';
import { fIsAfter } from 'src/utils/format-time';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

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
export function CommunityRewardLogView(props: { h: boolean }) {
  const { h: advancedUserListPage } = props;
  const openDateRange = useBoolean();

  const theme = useTheme();

  const [totalPurchase, setTotalPurchase] = useState<string>('');

  const params = useSetState<Prams>({
    member_address: '',
    date: undefined,
    page: 1,
    page_size: 10
  })

  // 过滤数据
  const [filteredData, setFilteredData] = useState<Item[]>([]);
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
  const canReset = !!params.state.member_address || !!params.state.date


  // 获取用户列表
  const getList = useCallback(async () => {
    setUsersLoading(true);
    getCommunityRewardsList(params.state)
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
  }, [params.state]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList]); // 在分页变化时，重新获取数据

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    const { member_address, date } = params.state

    // 只保留接口支持的搜索参数
    params.setState({
      member_address: member_address,
      date: date ?? undefined
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
      field: '$memberAddress',
      headerName: '用户地址 ',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.member.address || '-'} />,
      valueFormatter: (value, row) => row.member.address
    },
    {
      field: 'power',
      headerName: '个人算力',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'team_power',
      headerName: '团队算力',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'large_team_power',
      headerName: '大团队算力',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'small_team_all_power',
      headerName: '小团队总算力',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'dynamic_rate',
      headerName: '动态奖占比',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'dynamic_reward_amount',
      headerName: '动态奖',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'level_up_reward_amount',
      headerName: '晋级奖',
      minWidth: 200,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'member_level',
      headerName: '会员等级',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: 'open_virtual_region',
      headerName: '是否已开启虚拟大区',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value ? '已开启' : '未开启' } />,
      valueFormatter: (value) => value ? '已开启' : '未开启',
    },
    {
      field: 'uc_to_usdt',
      headerName: 'uc兑USDT比率',
      minWidth: 170,
      renderCell: ({ value }) => <CellWithTooltipCopy value={ value || '-'} />,
    },
    {
      field: '$createdAtString',
      headerName: '创建时间 ',
      minWidth: 170,
      renderCell: (params) => <CellWithTooltipCopy value={ params.row.created_at  ? params.row.created_at_string : '-' } />,
      valueFormatter: (value, row) => row.created_at ? row.created_at_string : '-',
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const handleDateChange = React.useCallback(
    (date: dayjs.Dayjs | null) => {
      params.setState({ date: date ? date.format('YYYY-MM-DD') : undefined })
    },
    []
  )

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="社区奖励列表"
          links={[
            { name: '管理',
            },
            { name: '充值',
            },
            { name: '社区奖励列表' },
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
              <DatePicker
                label="请选择日期"
                value={ params.state.date ? dayjs(params.state.date) : null }
                onChange={ handleDateChange }
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
    filters.setState({ date: undefined });
  }, [filters])

  const handleReset = useCallback(() => {
    filters.setState({ member_address: '', date: undefined });
  }, [filters]);

  return (
    <FiltersResult totalResults={totalResults} onReset={handleReset} sx={sx}>
    <FiltersBlock label="地址:" isShow={!!filters.state.member_address}>
      <Chip {...chipProps} label={filters.state.member_address} onDelete={handleRemoveAddress} />
    </FiltersBlock>
      <FiltersBlock label="时间:" isShow={!!filters.state.date }>
        <Chip
          {...chipProps}
          label={`${ dayjs(filters.state.date).format('YYYY-MM-DD') }`}
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
