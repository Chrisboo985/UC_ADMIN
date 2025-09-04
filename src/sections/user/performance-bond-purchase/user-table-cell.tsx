import { Tooltip, IconButton, Stack, Box } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useCopyToClipboard } from 'src/hooks/use-copy-to-clipboard';
import { toast } from 'src/components/snackbar';
import { useCallback, useRef } from 'react';
import { debounce, round, isNumber } from 'lodash-es';

export function CellWithTooltipCopy({ value, props = { displayLength: 0 } }: any) {
  const { copy } = useCopyToClipboard();
  // 创建一个防抖处理的函数引用，保持在组件重渲染间的稳定性
  const debouncedHandleCopyRef = useRef(
    debounce((text: string) => {
      if (!text) {
        console.log('无值不复');
        return;
      }
      toast.success('复制成功!');
      copy(text);
    }, 300) // 300ms的防抖延迟
  );

  const handleCopy = useCallback(
    () => {
      // 直接调用防抖函数
      debouncedHandleCopyRef.current(value);
    },
    [value]
  );

  // 过长内容通过父级参数props指定前后四位，默认完整展示
  const { displayLength = 0 } = props;
  // Format numbers with 6 decimal places, otherwise handle as string
  const displayValue = isNumber(value)
    ? round(value, 6).toString()
    : (displayLength !== 0 && value && value.length > displayLength)
      ? `${value.slice(0, displayLength / 2)}...${value.slice(-displayLength / 2)}`
      : value;

  return (
    <Tooltip title={value} placement="top">
      <Stack
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
        <Box
          onClick={handleCopy}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
            cursor: 'pointer',
          }}
        >
          {displayValue || '-'}
        </Box>

        {!!displayValue && (
          <IconButton
            size="small"
            onClick={handleCopy}
            className="copy-icon"
            sx={{
              opacity: 0,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                opacity: 1,
              },
            }}
          >
              <Iconify width={18} icon="solar:copy-bold" sx={{ pointerEvents: 'none' }} />
          </IconButton>
        )}
      </Stack>
    </Tooltip>
  );
}
