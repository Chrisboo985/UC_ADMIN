import type {
  ModelsRebaseLog,
  ResponsesPagedResponseArrayModelsRebaseLog,
} from 'src/types/rebaselog';

import type { IDatePickerControl } from 'src/types/common';
import type {
  GridSlots,
  GridColDef,
  GridRowSelectionModel,
  GridColumnVisibilityModel,
} from '@mui/x-data-grid';
import { toast } from 'sonner';
import { CONFIG } from 'src/config-global';
import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';
import { useState, useEffect, useCallback, useMemo, useReducer, memo } from 'react';

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

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import { AppWidgetSummary } from 'src/sections/overview/app/app-widget-summary';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import {
  getDaoLogIndexAPI,
  getDaoRewardRateAPI,
  getRebaseLogIndexAPI,
  setDaoRewardRateAPI,
} from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import EditRateDialog from './edit-rate-dialog'; // 新增导入

// ----------------------------------------------------------------------
// 筛选常量
const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions']; // ----------------------------------------------------------------------

// 用户列表视图主组件
export const DaoRecordView = memo(function DaoRecordView() {
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  const filters = useSetState<ModelsRebaseLog>({
    bond_id: undefined,
    member_id: undefined,
    created_at_end: 0,
    created_at_start: 0,
    order_direction: '',
    order_field: '',
  });

  const filtersForEdit = useSetState<{
    bond_id?: number | undefined | null | '';
    member_id?: number | undefined | null | '';
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    order_direction?: string;
    order_field?: string;
  }>({
    bond_id: '',
    member_id: '',
    created_at_end: null,
    created_at_start: null,
    order_direction: '',
    order_field: '',
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<ModelsRebaseLog[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ModelsRebaseLog[]>([]);
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
  const [daoRewardRate, setDaoRewardRate] = useState(0);
  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.bond_id || !!filtersForEdit.state.member_id;

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

  // 获取DAO Reward Rate
  const getDaoRewardRate = async () => {
    const apiResult = await getDaoRewardRateAPI();
    const { data, code } = apiResult;
    if (code === 0) {
      setDaoRewardRate(data.value);
    }
  };

  useEffect(() => {
    getDaoRewardRate();
  }, []);

  const getList = useCallback(async () => {
    const params = {
      ...filters.state,
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setUsersLoading(true);
    await getDaoLogIndexAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          console.log('接口返回结果data', data);

          const list = data.list.map((item: any) => ({
            ...item,
            id: item.ID,
          }));

          setFilteredData(data.list || []);
          setTotalCount(data.total || 0);
        } else {
          toast.error(apiResult.message);
          setFilteredData([]);
          setTotalCount(0);
        }
      })
      .finally(() => {
        setUsersLoading(false);
      });
  }, [pagination.page, pagination.pageSize, filters.state]);

  //  请求数据
  useEffect(() => {
    getList();
  }, [getList, pagination]); // 在分页变化时，重新获取数据

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

  const [openSetRateDialog, setOpenSetRateDialog] = useState(false); // 新增状态

  const handleSetDaoRewardRate = async (rate: number) => {
    try {
      const apiResult = await setDaoRewardRateAPI({ rate });
      toast.success(apiResult.message || '设置 DAO 奖励率成功');
      getDaoRewardRate();
    } catch (error) {
      console.error('设置 DAO 奖励率失败:', error);
      toast.error('设置 DAO 奖励率失败');
    }
  }; // 新增函数

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

  const columns: GridColDef[] = [
    {
      field: 'id',
      headerName: 'ID',
      description: 'Rebase记录ID',
      minWidth: 80,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    },
    {
      field: 'created_at_string',
      headerName: '创建时间',
      description: '记录创建时间',
      minWidth: 200,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.created_at_string} />,
    },
    {
      field: 'status_string',
      headerName: '状态',
      description: '记录状态描述',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.status_string} />,
    },
    {
      field: 'credit_amount',
      headerName: '已发放信用治理奖金',
      description: '已发放信用治理奖金',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.credit_amount} />,
    },
    {
      field: 'credit_rate',
      headerName: '信用治理奖金比率',
      description: '信用治理奖金比率',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.credit_rate} />,
    },
    {
      field: 'custom_amount',
      headerName: '已发放自治基金',
      description: '已发放自治基金',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.custom_amount} />,
    },
    {
      field: 'custom_rate',
      headerName: '自治基金比率',
      description: '自治基金比率',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.custom_rate} />,
    },
    {
      field: 'level_amount',
      headerName: '已发放社区治理奖金',
      description: '已发放社区治理奖金',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.level_amount} />,
    },
    {
      field: 'level_rate',
      headerName: '社区治理奖金比率',
      description: '社区治理奖金比率',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.level_rate} />,
    },
    {
      field: 'reward_rate',
      headerName: 'dao总奖励比率',
      description: 'dao总奖励比率',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.reward_rate} />,
    },
    {
      field: 'total_amount',
      headerName: '总数量',
      description: '总数量',
      minWidth: 100,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.total_amount} />,
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
          heading="DAO记录列表"
          links={[{ name: '控制台', href: paths.dashboard.root }, { name: 'DAO记录列表' }]}
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
            justifyContent={{ xs: 'flex-start', md: 'space-between' }}
          >
            <DaoRewardRateCard daoRewardRate={daoRewardRate} /> 

            <Button variant="contained" onClick={() => setOpenSetRateDialog(true)} sx={{ ml: 1 }}>
              设置 DAO 奖励率
            </Button>

            <EditRateDialog
              open={openSetRateDialog}
              onClose={() => setOpenSetRateDialog(false)}
              currentRate={Number(daoRewardRate)}
              onSuccess={handleSetDaoRewardRate}
            />
          </Stack>

          {/* 数据表格，采用服务端理数据模式 */}
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
});

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

const DaoRewardRateCard = memo(
  ({ daoRewardRate }: { daoRewardRate: number }) => (
    <>
      <AppWidgetSummary
        title="当前DAO奖励率"
        percent={0}
        hideRenderTrending
        unit="%"
        total={round(Number(daoRewardRate * 100), 4)}
        sx={{ py: 0, borderRadius: 1, boxShadow: 0,  }}
        chart={{
          colors: ['success', 'warning', 'error'],
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
    </>
  ),
  (props, prevProps) => props.daoRewardRate === prevProps.daoRewardRate
);

// ----------------------------------------------------------------------
