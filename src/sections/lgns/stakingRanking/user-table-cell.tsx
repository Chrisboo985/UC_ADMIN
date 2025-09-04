import type { GridCellParams } from '@mui/x-data-grid';

import { Tooltip, IconButton, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { toast } from 'src/components/snackbar';
import { useCallback } from 'react';

export function CellWithTooltipCopy({ value }: any) {
  const { copy } = useCopyToClipboard();

  const handleCopy = useCallback(() => {
    toast.success('复制成功!');
    copy(value);
  }, [copy, value]);

  return (
    <Tooltip title={value} placement="top">
      <Stack
        onClick={handleCopy}
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          width: '100%',
          position: 'relative',
          cursor: 'pointer',
          '&:hover .copy-icon': {
            opacity: 1,
          },
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {value}
        </div>
        <IconButton
          size="small"
          onClick={handleCopy}
          className="copy-icon"
          sx={{
            opacity: 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Iconify width={18} icon="solar:copy-bold" />
        </IconButton>
      </Stack>
    </Tooltip>
  );
}
