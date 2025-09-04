import type { IUserItemforlist } from 'src/types/user';
import type { ModelsStake } from 'src/types/stake';

import type { IDatePickerControl } from 'src/types/common';
import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';

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
import { toast } from 'sonner';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { getMemberIndexAPI, MemberListData } from 'src/api/user';
import { getStakeIndexAPI } from 'src/api/finance';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function PledgeRecordsView() {
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  const filters = useSetState<ModelsStake>({
    address: '',
    created_at_end: 0,
    created_at_start: 0,
    id: undefined,
    hash: '',
    order_direction: '',
    order_field: '',
  });

  const filtersForEdit = useSetState<{
    address?: string;
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    id?: number | undefined | null | '';
    hash?: string;
    order_direction?: string;
    order_field?: string;
    member_address?: string;
  }>({
    address: '',
    created_at_end: null,
    created_at_start: null,
    id: '',
    hash: '',
    order_direction: '',
    order_field: '',
    member_address: '',
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<ModelsStake[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ModelsStake[]>([]);
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

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.member_address || !!filtersForEdit.state.hash;
  // const canReset = Object.values(filtersForEdit.state).some(
  //   (value) => value !== null && value !== '' && value !== undefined
  // );

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

  const getList = useCallback(async () => {
    const params = {
      ...filters.state,

      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setUsersLoading(true);
    await getStakeIndexAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          setFilteredData(data.list as ModelsStake[]);
          setTotalCount(data.total);
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

  // 服务端控制 条件筛选
  const handleFilterData = () => {
    console.log('应用筛选');

    filters.setState({
      address: filtersForEdit.state.address || undefined,
      id: filtersForEdit.state.id || undefined,
      hash: filtersForEdit.state.hash || undefined,
      member_address: filtersForEdit.state.member_address || undefined,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.endOf('day').unix(),
    });
  };

  const handleViewRow = useCallback(
    (item: Object) => {
      console.log('查看详情', item);
      // router.push(paths.dashboard.product.details(id));
    },
    [] // Keep empty since it doesn't depend on external variables
  );

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

  const handleFilterID = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ id: Number(event.target.value) || undefined });
    },
    [filtersForEdit] // Include filtersForEdit in dependencies
  );

  const handleFilterHash = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ hash: event.target.value });
    },
    [filtersForEdit]
  );

  const handleFilterMemberAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ member_address: event.target.value });
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

  // 地址， 质押数量， 时间, 操作
  const columns: GridColDef[] = [
    // {
    //   field: 'id',
    //   headerName: 'ID',
    //   hideable: false,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    // },

    // {
    //   field: 'id',
    //   headerName: '质押记录ID',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    // },
    // {
    //   field: 'member_id',
    //   headerName: '会员ID',
    //   minWidth: 80,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.member_id} />,
    // },
    {
      field: 'member_address',
      headerName: '会员地址',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.member_address} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'hash',
      headerName: '交易Hash',
      minWidth: 240,
      flex: 1,
      renderCell: (params) =>
        params.row.hash ? (
          <CellWithTooltipCopy
            value={params.row.hash}
            props={{
              displayLength: 24,
              onClick: () => {
                window.open(`${CONFIG.hexscanUrl}/tx/${params.row.hash}`, '_blank');
              },
            }}
          />
        ) : null,
    },

    {
      field: 'amount',
      headerName: '质押数量',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={round(params.row.amount, 10)} />,
    },

    // {
    //   field: 'is_frozen',
    //   headerName: '冻结状态',
    //   minWidth: 100,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.is_frozen ? '是' : '否'} />,
    // },
    {
      field: 'tx_at_string',
      headerName: '质押时间',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.tx_at_string} />,
    },
    // {
    //   field: 'updated_at_string',
    //   headerName: '更新时间',
    //   minWidth: 190,
    //   flex: 1,
    //   renderCell: (params) => <CellWithTooltipCopy value={params.row.updated_at_string} />,
    // },

    // {
    //   type: 'actions',
    //   field: 'actions',
    //   headerName: '操作',
    //   align: 'right',
    //   headerAlign: 'right',
    //   width: 80,
    //   sortable: false,
    //   filterable: false,
    //   disableColumnMenu: true,
    //   getActions: (params) => [
    //     <GridActionsCellItem
    //       showInMenu
    //       icon={<Iconify icon="solar:eye-bold" />}
    //       label="查看详情"
    //       onClick={() => handleViewRow(params.row)}
    //       disabled={params.row.id === 1}
    //     />,
    //   ],
    // },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="质押记录"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '财务控制台', href: paths.dashboard.financialConsole.root },
            { name: '质押记录' },
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

            <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
              <TextField
                fullWidth
                value={filtersForEdit.state.hash}
                onChange={handleFilterHash}
                placeholder="请输入交易Hash"
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
            checkboxSelection
            disableRowSelectionOnClick
            rows={filteredData}
            columns={columns}
            loading={usersLoading}
            // getRowHeight={() => 'auto'}
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
            }}
            // sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
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
