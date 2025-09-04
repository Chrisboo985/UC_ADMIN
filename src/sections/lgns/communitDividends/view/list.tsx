import type { IUserItemforlist } from 'src/types/user';
import type { ModelsCommunityBonusRateConfig, ModelsStake } from 'src/types/stake';

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
import { toast } from 'sonner';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import { max, round } from 'lodash-es';
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

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { getMemberIndexAPI, MemberListData } from 'src/api/user';
import {
  getCommunityBonusRateIndexAPI,
  getStakeIndexAPI,
  updateCommunityBonusRateAPI,
} from 'src/api/finance';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import EditRateDialog from './edit-rate-dialog';

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function CommunitDividendsView() {
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  // 编辑弹窗状态
  const [editDialog, setEditDialog] = useState({
    open: false,
    id: 0,
    rate: 0,
    title: '',
    max: 0,
  });

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

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

  const comfirmEditRate = useCallback(
    async (rate: number) => {
      const stop = toast.loading('修改中...');
      setEditDialog((prev) => ({ ...prev, open: false }));
      try {
        await updateCommunityBonusRateAPI({ id: editDialog.id, rate }).then((res) => {
          if (res.code === 0) {
            toast.success('修改成功');
            getList();
            toast.dismiss(stop);
          }
        });
      } catch (error) {
        console.error('Failed to update rate:', error);
        toast.error('修改失败');
      }
      toast.dismiss(stop);
    },
    [editDialog.id]
  );

  const getList = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await getCommunityBonusRateIndexAPI();
      if (response.code === 0) {
        setFilteredData(response.data as ModelsCommunityBonusRateConfig[]);
        setTotalCount(response.data.total || response.data.length);
      } else {
        toast.error(response.message);
        setFilteredData([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch list:', error);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // 请求数据
  useEffect(() => {
    getList();
  }, [getList, pagination.page, pagination.pageSize, filters.state]);

  // 监听日期验证和弹窗关闭
  useEffect(() => {
    if (!openDateRange.value) {
      if (!dateError) {
        setLastValidDateRange({
          start: filtersForEdit.state.created_at_start,
          end: filtersForEdit.state.created_at_end,
        });
      } else {
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

  const handleEditRate = useCallback((item: ModelsCommunityBonusRateConfig) => {
    setEditDialog({
      open: true,
      id: item.id!,
      rate: item.rate!,
      title: item.title!,
      max: Number(item.max_rate! || 0),
    });
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setEditDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleApply = (start: IDatePickerControl, end: IDatePickerControl) => {
    filtersForEdit.setState({ created_at_start: start, created_at_end: end });
  };

  const handleFilterAddress = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ address: event.target.value });
    },
    [filtersForEdit]
  );

  const handleFilterID = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      filtersForEdit.setState({ id: Number(event.target.value) || undefined });
    },
    [filtersForEdit]
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
    [canReset, memoizedFiltersForEdit, selectedRowIds, filteredData, setFilterButtonEl]
  );

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: '等级',
      minWidth: 220,
      flex: 1,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <CellWithTooltipCopy value={params.row.title} props={{ displayLength: 16 }} />
      ),
    },
    {
      field: 'large_performance',
      headerName: '大区业绩',
      minWidth: 240,
      flex: 1,
      renderCell: (params) =>
        params.row.large_performance ? (
          <CellWithTooltipCopy
            value={params.row.large_performance}
            props={{
              displayLength: 24,
            }}
          />
        ) : null,
    },
    {
      field: 'small_performance',
      headerName: '社区贡献',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={round(params.row.small_performance, 10)} />
      ),
    },
    {
      field: 'stake_amount',
      headerName: '个人质押数量',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.stake_amount} />,
    },
    {
      field: 'rate',
      headerName: '贡献值分红比例',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.rate} />,
    },
    {
      field: 'updated_at_string',
      headerName: '更新时间',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.updated_at_string} />,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: '操作',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="修改分红比例"
          onClick={() => handleEditRate(params.row)}
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
          heading="社区分红"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '合约控制台', href: paths.dashboard.lgns.root },
            { name: '社区分红' },
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
          <DataGrid
            checkboxSelection={false}
            disableRowSelectionOnClick
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
            onSortModelChange={(model) => {
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
              console.log('更改列表筛选', model);
            }}
            rowCount={totalCount}
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
          />
        </Card>
      </DashboardContent>

      {/* 修改分红比例弹窗 */}
      <EditRateDialog
        open={editDialog.open}
        onClose={handleCloseEditDialog}
        currentRate={editDialog.rate}
        title={editDialog.title}
        id={editDialog.id}
        onSuccess={comfirmEditRate}
        max={editDialog.max}
      />
    </>
  );
}

// ----------------------------------------------------------------------

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
