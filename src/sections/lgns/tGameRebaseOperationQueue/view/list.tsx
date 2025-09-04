/*


1、【等待】更换logo
2、【完成】隐藏多余导航
3、【完成】完成列表多语言切换脚手架
4、【完成】隐藏多余功能和按钮
5、单元格选中复制组件；
6、【完成】放开筛选功能；
7、【完成】日期组件选中复制等；
8、【完成】表单，筛选，体验 
9、表单报错问题

*/

import type { UseSetStateReturn } from 'src/hooks/use-set-state';
import type { IUserTableFiltersForList } from 'src/types/user';

import type {
  ModelsRebaseRateQueue,
  ResponsesPagedResponseModelsRebaseRateQueue,
} from 'src/types/rebase';
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

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
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

import { toast } from 'src/components/snackbar';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { round } from 'lodash-es';
import {
  createRebaseRateQueueAPI,
  getRebaseRateQueueIndexAPI,
  updateRebaseRateQueueAPI,
} from 'src/api/lgns';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CustomDateRangePicker } from 'src/components/custom-date-range-picker';
import { CellWithTooltipCopy } from '../user-table-cell';
import { UserTableFiltersResult } from '../user-table-filters-result';
import { PledgeForm, EventSchemaType } from '../pledge-form';
// ----------------------------------------------------------------------

// 筛选常量
const HIDE_COLUMNS = { category: false };
const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

// 用户列表视图主组件
export function TGameRebaseOperationQueueView() {
  const theme = useTheme();

  const [openPledgeForm, setOpenPledgeForm] = useState(false);
  const confirmRows = useBoolean();
  const router = useRouter();
  const openDateRange = useBoolean();

  const filters = useSetState<IUserTableFiltersForList>({
    address: '',
    created_at_end: 0,
    created_at_start: 0,
    id: undefined,
    order_direction: '',
    order_field: '',
  });

  const filtersForEdit = useSetState<{
    address?: string;
    created_at_end: IDatePickerControl;
    created_at_start: IDatePickerControl;
    id?: number | undefined | null | '';
    order_direction?: string;
    order_field?: string;
  }>({
    address: '',
    created_at_end: null,
    created_at_start: null,
    id: '',
    order_direction: '',
    order_field: '',
  });
  // 用户最后一次有效的日期范围
  const [lastValidDateRange, setLastValidDateRange] = useState<{
    start?: IDatePickerControl;
    end?: IDatePickerControl;
  }>({});

  // 列表数据
  const [tableData, setTableData] = useState<ModelsRebaseRateQueue[]>([]);
  // 过滤数据
  const [filteredData, setFilteredData] = useState<ModelsRebaseRateQueue[]>([]);
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

  const [currentUser, setCurrentUser] = useState<ModelsRebaseRateQueue>(
    {} as ModelsRebaseRateQueue
  );

  // 筛选条件是否能够重置
  const canReset = !!filtersForEdit.state.address || !!filtersForEdit.state.id;
  // const canReset = Object.values(filtersForEdit.state).some(
  //   (value) => value !== null && value !== '' && value !== undefined
  // );

  const dateError = fIsAfter(
    filtersForEdit.state.created_at_start,
    filtersForEdit.state.created_at_end
  );

  const handleClosePledgeForm = useCallback(() => {
    setOpenPledgeForm(false);
    setCurrentUser({} as ModelsRebaseRateQueue);
  }, []);

  const getList = useCallback(async () => {
    const params = {
      ...filters.state,

      coin: 'tgame',
      page: pagination.page,
      page_size: pagination.pageSize,
    };

    setUsersLoading(true);
    await getRebaseRateQueueIndexAPI(params)
      .then((apiResult) => {
        console.log('接口返回结果', apiResult);
        const { data, code } = apiResult;
        if (code === 0) {
          setFilteredData(data?.list as ModelsRebaseRateQueue[]);
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

    // 获取时间参数，
    filters.setState({
      address: filtersForEdit.state.address,
      id: filtersForEdit.state.id,
      created_at_start: filtersForEdit.state.created_at_start?.unix(),
      created_at_end: filtersForEdit.state.created_at_end?.endOf('day').unix(),
    });
  };

  const handleViewRow = useCallback(
    (item: Object) => {
      console.log('查看详情', item);
      setCurrentUser(item as ModelsRebaseRateQueue);
      setOpenPledgeForm(true);
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

  const memoizedFiltersForEdit = useMemo(
    () => ({
      state: filtersForEdit.state,
      setState: filtersForEdit.setState,
    }),
    [filtersForEdit.setState, filtersForEdit.state]
  );

  const handleAddRebaseQueue = () => {
    console.log('增加Rebase队列');
    setOpenPledgeForm(true);
  };

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
      hideable: false,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.id} />,
    },
    {
      field: 'rebase_log_id',
      headerName: '关联ID',
      hideable: false,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.rebase_log_id} />,
    },
    // 状态
    {
      field: 'status_string',
      headerName: '状态',
      minWidth: 150,
      flex: 1,
      renderCell: (params) => <CellWithTooltipCopy value={params.row.status_string} />,
    },

    {
      field: 'rate',
      headerName: '利率',
      minWidth: 190,
      flex: 1,
      renderCell: (params) => (
        <CellWithTooltipCopy value={`${round(params.row.rate * 100, 10)}%`} />
      ),
    },

    // Rebase时间
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
          icon={<Iconify icon="solar:gallery-edit-bold-duotone" />}
          label="修改Rebase利率"
          onClick={() => handleViewRow(params.row)}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  const handleFormSubmit = async (formData: EventSchemaType) => {
    try {
      if (currentUser?.id) {
        // 编辑模式
        await updateRebaseRateQueueAPI({
          coin: 'tgame', id: currentUser.id.toString(), ...formData });
        toast.success('修改成功');
      } else {
        // 新增模式
        await createRebaseRateQueueAPI({ coin: 'tgame', ...formData });
        toast.success('新增成功');
      }
      handleClosePledgeForm();
      getList();
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    }
  };

  return (
    <>
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
              value={filtersForEdit.state.id}
              onChange={handleFilterID}
              placeholder="请输入id"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
            />
          </FormControl>

          {/* 选择日期范围 */}
          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
            <Button
              color="inherit"
              onClick={openDateRange.onTrue}
              endIcon={
                <Iconify
                  icon={openDateRange ? 'eva:arrow-ios-upward-fill' : 'eva:arrow-ios-downward-fill'}
                  sx={{ ml: -0.5 }}
                />
              }
            >
              {!!filtersForEdit.state.created_at_start && !!filtersForEdit.state.created_at_end
                ? fDateRangeShortLabel(
                    filtersForEdit.state.created_at_start,
                    filtersForEdit.state.created_at_end
                  )
                : '选日期'}
            </Button>
            <CustomDateRangePicker
              variant="calendar"
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

          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
            <Button variant="contained" onClick={handleFilterData}>
              查询
            </Button>
          </FormControl>

          <FormControl component="fieldset" sx={{ flexShrink: 1, minWidth: { xs: 1, md: 200 } }}>
            <Button variant="contained" onClick={handleAddRebaseQueue}>
              增加tGameRebase队列
            </Button>
          </FormControl>
        </Stack>

        {/* 数据表格，采用服务端管理数模式 */}
        <DataGrid
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

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openPledgeForm}
        onClose={handleClosePledgeForm}
        transitionDuration={{
          enter: theme.transitions.duration.shortest,
          exit: theme.transitions.duration.shortest - 80,
        }}
        PaperProps={{
          sx: {
            display: 'flex',
            overflow: 'hidden',
            flexDirection: 'column',
            '& form': {
              minHeight: 0,
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
          },
        }}
      >
        <DialogTitle sx={{ minHeight: 76 }}>
          {currentUser.id ? '设置' : '新增'}Rebase利率操作
        </DialogTitle>
        <PledgeForm
          currentEvent={currentUser}
          onClose={handleClosePledgeForm}
          onSubmit={handleFormSubmit}
        />
      </Dialog>
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
