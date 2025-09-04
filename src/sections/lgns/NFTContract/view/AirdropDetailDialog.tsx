import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  LinearProgress,
  Chip,
  Link,
  TextField,
  Stack,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { fDateTime } from 'src/utils/format-time';
import { getAirdropDetailsAPI, AirdropDetailRecord } from 'src/api/lgns';
import { CellWithTooltipCopy } from 'src/sections/user/user-table-cell';

interface AirdropDetailDialogProps {
  open: boolean;
  onClose: () => void;
  airdropId: string;
}

const columns: GridColDef[] = [
  {
    field: 'address',
    headerName: '会员地址',
    flex: 1,
    align: 'center',
    renderCell: (params) => <CellWithTooltipCopy value={params.row.address} />,
  },
  {
    field: 'status',
    headerName: '状态',
    width: 120,
    align: 'center',
    renderCell: (params) => (
      <Chip
        label={params.row.status === 1 ? '成功' : '失败'}
        color={params.row.status === 1 ? 'success' : 'error'}
        size="small"
      />
    ),
  },
  {
    field: 'amount_change',
    headerName: '变动金额',
    width: 130,
    align: 'center',
  },
  {
    field: 'amount_before',
    headerName: '变动前金额',
    width: 130,
    align: 'center',
  },
  {
    field: 'amount_after',
    headerName: '变动后金额',
    width: 130,
    align: 'center',
  },
  {
    field: 'created_at',
    headerName: '创建时间',
    width: 180,
    renderCell: (params) => fDateTime(params.value, 'YYYY-MM-DD HH:mm:ss'),
  },
];

export default function AirdropDetailDialog({
  open,
  onClose,
  airdropId,
}: AirdropDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<AirdropDetailRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchAddress, setSearchAddress] = useState('');

  const fetchDetails = async () => {
    if (!airdropId) return;

    try {
      setLoading(true);
      const response = await getAirdropDetailsAPI({
        air_drop_log_id: airdropId,
        address: searchAddress || undefined,
        page,
        page_size: pageSize,
      });
      console.log('API response:', response);
      if (response.code === 0) {
        setDetails(response.data.list);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch airdrop details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDetails();
    }
  }, [open, page, pageSize, searchAddress]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>空投详情</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="搜索地址"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            size="small"
            sx={{ width: 300, mt: 2 }}
          />

          <Box sx={{ height: 600, width: '100%' }}>
            {loading && <LinearProgress />}
            <DataGrid
              rows={details}
              columns={columns}
              rowCount={total}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              paginationMode="server"
              paginationModel={{
                page: page - 1,
                pageSize,
              }}
              onPaginationModelChange={(model) => {
                setPage(model.page + 1);
                setPageSize(model.pageSize);
              }}
              disableRowSelectionOnClick
            />
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
