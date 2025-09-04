import { useState, useCallback, useEffect } from 'react';

import {
  Box,
  Card,
  Table,
  Button,
  Dialog,
  Container,
  TableBody,
  TextField,
  Typography,
  TableContainer,
  TablePagination,
  InputAdornment,
} from '@mui/material';

import { useSetState } from 'src/hooks/use-set-state';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useSettingsContext } from 'src/components/settings';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { getParentListAPI, type ParentListItem, type ParentListRequest } from 'src/api/user';
import { paths } from 'src/routes/paths';

import { ParentListTableRow } from '../parent-list-table-row';
import { CapitalFlowForm } from '../capital-flow-form';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'parent_level', label: '上级层级', width: 120, minWidth: 100 },
  { id: 'member_code', label: '用户编码', width: 150, minWidth: 120 },
  { id: 'h_username', label: '登录名', width: 140, minWidth: 120 },
  { id: 'h_nickname', label: '用户昵称', width: 140, minWidth: 120 },
  { id: 'address', label: '用户地址', width: 200, minWidth: 180 },
  { id: 'address_status', label: '地址状态', width: 120, minWidth: 100 },
  { id: 'is_active', label: '激活状态', width: 120, minWidth: 100 },
  { id: 'status', label: '用户状态', width: 120, minWidth: 100 },
  { id: 'withdraw_status', label: '提现状态', width: 120, minWidth: 100 },
  { id: 'is_business', label: '是否商家', width: 120, minWidth: 100 },
  { id: 'level', label: '等级', width: 100, minWidth: 80 },
  { id: 'virtual_level', label: '虚拟等级', width: 120, minWidth: 100 },
  { id: 'star_level', label: '星级', width: 100, minWidth: 80 },
  { id: 'mc', label: 'MC', width: 120, minWidth: 100 },
  { id: 'power', label: '有效算力', width: 120, minWidth: 100 },
  { id: 'large_team_power_total', label: '大团队累积算力', width: 150, minWidth: 130 },
  { id: 'small_team_power_total', label: '小团队累积算力', width: 150, minWidth: 130 },
  { id: 'team_power_total', label: '团队累积算力', width: 140, minWidth: 120 },
  { id: 'total_power', label: '累积算力', width: 120, minWidth: 100 },
  { id: 'hp', label: 'HP', width: 120, minWidth: 100 },
  { id: 'tp', label: 'TP', width: 120, minWidth: 100 },
  { id: 'up', label: 'UP', width: 120, minWidth: 100 },
  { id: 'wapd', label: 'WAPD', width: 120, minWidth: 100 },
  { id: 'apd', label: 'APD', width: 120, minWidth: 100 },
  { id: 'apd_to_usdt_amount', label: 'APD-USDT', width: 140, minWidth: 120 },
  { id: 'bp', label: 'BP', width: 120, minWidth: 100 },
  { id: 'cp', label: 'CP', width: 120, minWidth: 100 },
  { id: 'rp', label: 'RP', width: 120, minWidth: 100 },
  { id: 'xapd', label: 'XAPD', width: 120, minWidth: 100 },
  { id: 'xapd_to_usdt_amount', label: 'XAPD-USDT', width: 140, minWidth: 120 },
  { id: 'id', label: 'ID', width: 100, minWidth: 80 },
];

const defaultFilters = {
  parent: '',
};

// ----------------------------------------------------------------------

export default function ParentListView() {
  const settings = useSettingsContext();

  const table = useTable();

  const [tableData, setTableData] = useState<ParentListItem[]>([]);

  const { state: filters, setState: setFilters } = useSetState(defaultFilters);

  const [loading, setLoading] = useState(false);

  const [totalCount, setTotalCount] = useState(0);

  const [openCapitalFlowDialog, setOpenCapitalFlowDialog] = useState(false);
  const [currentUserForCapitalFlow, setCurrentUserForCapitalFlow] = useState<ParentListItem | null>(null);
  const [currentUserForCapitalFlowType, setCurrentUserForCapitalFlowType] = useState<string | null>(null);

  const handleFilters = useCallback(
    (name: string, value: string) => {
      table.onResetPage();
      setFilters({ [name]: value });
    },
    [setFilters, table]
  );

  const handleSearch = useCallback(async () => {
    if (!filters.parent.trim()) {
      return;
    }

    setLoading(true);
    try {
      const requestData: ParentListRequest = {
        parent: filters.parent,
        page: 1,
        page_size: 10,
      };

      const response = await getParentListAPI(requestData);
      // API直接返回数组，不是包装在list中
      if (Array.isArray(response.data)) {
        setTableData(response.data);
        setTotalCount(response.data.length);
      } else {
        // 如果是包装格式
        setTableData(response.data.list || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (error) {
      console.error('查询上级失败:', error);
      setTableData([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters.parent]);

  const handleCapitalFlow = useCallback((row: ParentListItem, type: string) => {
    setCurrentUserForCapitalFlow(row);
    setCurrentUserForCapitalFlowType(type);
    setOpenCapitalFlowDialog(true);
  }, []);

  const handleCloseCapitalFlow = useCallback(() => {
    setOpenCapitalFlowDialog(false);
    setCurrentUserForCapitalFlow(null);
    setCurrentUserForCapitalFlowType(null);
  }, []);





  const dataFiltered = tableData;

  // API已经返回分页后的数据，不需要前端再次分页
  const dataInPage = dataFiltered;

  const denseHeight = table.dense ? 52 : 72;

  const canReset = !!filters.parent;

  const notFound = !dataFiltered.length;

  return (
    <Container maxWidth={settings.compactLayout ? 'lg' : false}>
      <CustomBreadcrumbs
        heading="查询上级"
        links={[
          { name: '数据概览', href: paths.dashboard.root },
          { name: '会员', href: paths.dashboard.user.root },
          { name: '查询上级' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />

      <Card>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              value={filters.parent}
              onChange={(event) => handleFilters('parent', event.target.value)}
              placeholder="请输入上级编码或地址"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 320 }}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{ minWidth: 120 }}
            >
              查询
            </Button>


          </Box>
        </Box>

        <TableContainer sx={{ position: 'relative', overflow: 'hidden' }}>

          <Scrollbar sx={{ maxHeight: 720, overflowX: 'auto' }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 2800, tableLayout: 'fixed' }}>
              <TableHeadCustom
                headLabel={TABLE_HEAD}
                rowCount={tableData.length}
                numSelected={0}
              />

              <TableBody>
                {dataInPage.map((row) => (
                  <ParentListTableRow
                      key={row.id}
                      row={row}
                      selected={false}
                      onSelectRow={() => {}}
                      onCapitalFlow={(type) => handleCapitalFlow(row, type)}
                    />
                ))}

                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                />

                <TableNoData notFound={notFound} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>


      </Card>

      <Dialog
        open={openCapitalFlowDialog}
        onClose={handleCloseCapitalFlow}
        maxWidth="lg"
        fullWidth
      >
        {currentUserForCapitalFlow && currentUserForCapitalFlowType && (
          <CapitalFlowForm
            open={openCapitalFlowDialog}
            currentUser={currentUserForCapitalFlow}
            type={currentUserForCapitalFlowType}
            onClose={handleCloseCapitalFlow}
          />
        )}
      </Dialog>
    </Container>
  );
}
