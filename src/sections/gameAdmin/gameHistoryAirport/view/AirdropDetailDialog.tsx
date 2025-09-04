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
import { getEventListAPI, GetEventListResponse } from 'src/api/gameAdmin';
import { CellWithTooltipCopy } from 'src/sections/user/user-table-cell';

interface AirdropDetailDialogProps {
  open: boolean;
  onClose: () => void;
  airdropId: string;
}

const columns: GridColDef[] = [
  // { field: 'id', headerName: 'ID', width: 100 },
  { field: 'plane_game_record_id', headerName: '游戏记录ID', width: 120 },
  { field: 'step', headerName: '步骤', width: 100 },
  { field: 'event_type', headerName: '事件类型', width: 220 },
  { field: 'desc', headerName: '事件描述', width: 220 },
  { field: 'airportId', headerName: '机场ID', width: 100 },
  { field: 'timestamp', headerName: '时间戳', width: 180 },
  { field: 'reported_at_string', headerName: '上报时间', width: 180 },
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
  const [details, setDetails] = useState<GetEventListResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchEventType, setSearchEventType] = useState('');

  const fetchDetails = async () => {
    if (!airdropId) return;

    try {
      setLoading(true);
      const response = await getEventListAPI({
        plane_game_record_id: airdropId,
        event_type: searchEventType,
        page,
        page_size: pageSize,
      });
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
  }, [open, page, pageSize, searchEventType]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>游戏事件列表</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <TextField
            label="搜索事件类型"
            value={searchEventType}
            onChange={(e) => setSearchEventType(e.target.value)}
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
