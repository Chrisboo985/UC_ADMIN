import type { GridCellParams } from '@mui/x-data-grid';

import { Tooltip, IconButton, Stack } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { toast } from 'src/components/snackbar';
import { useCallback } from 'react';

export function CellWithTooltipCopy({
  value,
  props = { displayLength: 0, onClick: () => {} },
}: any) {
  const { copy } = useCopyToClipboard();

  const handleCopy = useCallback(() => {
    if (!value) {
      console.log('无值不复');
      return;
    }
    toast.success('复制成功!');
    copy(value);

    props?.onClick?.();
  }, [copy, value, props]);

  // 过长内容通过父级参数props指定前后四位，默认完整展示
  const { displayLength = 0 } = props;
  const displayValue =
    displayLength !== 0 && value?.length > displayLength
      ? `${value?.slice(0, displayLength / 2)}...${value?.slice(-displayLength / 2)}`
      : value;

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
          {displayValue || '-'}
        </div>

        {!!displayValue && (
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
        )}
      </Stack>
    </Tooltip>
  );
}
