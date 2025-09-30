import React, { useEffect, useState } from 'react';
import type { DialogProps } from '@mui/material/Dialog';
import type { IDatePickerControl } from 'src/types/common';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormHelperText from '@mui/material/FormHelperText';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { StaticDateTimePicker } from '@mui/x-date-pickers/StaticDateTimePicker';

import { fIsAfter, fDateRangeShortLabel } from 'src/utils/format-time';
import { useResponsive } from 'src/hooks/use-responsive';

import type { UseDateRangePickerReturn } from './types';

// ----------------------------------------------------------------------

export function CustomDateRangePicker({
  open,
  error,
  endDate,
  onClose,
  startDate,
  PaperProps,
  onChangeEndDate,
  variant = 'input',
  onChangeStartDate,
  title = '选择时间范围',
  onApply, // 新增的 onApply 回调，父组件通过它来获取选择的数据
  ...other
}: DialogProps & UseDateRangePickerReturn) {
  const mdUp = useResponsive('up', 'md');

  const isCalendarView = variant === 'calendar';

  // 保存上次的有效数据
  const [prevStartDate, setPrevStartDate] = useState<IDatePickerControl>(startDate);
  const [prevEndDate, setPrevEndDate] = useState<IDatePickerControl>(endDate);

  // 选择日期时更新 startDate 和 endDate
  const [currentStartDate, setCurrentStartDate] = useState<IDatePickerControl>(startDate);
  const [currentEndDate, setCurrentEndDate] = useState<IDatePickerControl>(endDate);

  // 如果打开了对话框，保存当前的 startDate 和 endDate 到 prev 变量
  useEffect(() => {
    setPrevStartDate(startDate);
    setPrevEndDate(endDate);
  }, [startDate, endDate, open]);

  // 同步内部 current* 到外部传入的 start/end（以及打开时）
  useEffect(() => {
    setCurrentStartDate(startDate);
    setCurrentEndDate(endDate);
  }, [startDate, endDate, open]);

  const handleCancel = () => {
    // 点击取消时，重置为上次有效的日期
    setCurrentStartDate(prevStartDate);
    setCurrentEndDate(prevEndDate);
    onClose(); // 关闭对话框
  };

  const dateError = fIsAfter(currentStartDate, currentEndDate);
  const handleApply = () => {
    if (dateError) {
      return;
    }

    // 点击确认时，调用 onApply 回调，将用户选择的数据传递给父组件
    if (onApply && currentStartDate && currentEndDate) {
      onApply(currentStartDate, currentEndDate); // 将选择的日期传递给父组件
      onClose(); // 关闭对话框
    }
  };

  const handleReset = () => {
    // 立刻清空内部显示
    setCurrentStartDate(null);
    setCurrentEndDate(null);
    if (onApply) {
      onApply(null, null); // 将选择的日期传递给父组件
    }
    onClose(); // 关闭对话框
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={handleCancel}
      maxWidth={isCalendarView ? false : 'xs'}
      PaperProps={{
        ...PaperProps,
        sx: {
          ...(isCalendarView && { maxWidth: 720 }),
          ...PaperProps?.sx,
        },
      }}
      {...other}
    >
      <DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

      <DialogContent sx={{ ...(isCalendarView && mdUp && { overflow: 'unset' }) }}>
        <Stack
          justifyContent="center"
          spacing={isCalendarView ? 3 : 2}
          direction={isCalendarView && mdUp ? 'row' : 'column'}
          sx={{ pt: 1 }}
        >
          {isCalendarView ? (
            <>
              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <StaticDateTimePicker
                  value={currentStartDate}
                  onChange={setCurrentStartDate}
                  views={["year","month","day","hours","minutes","seconds"]}
                  slotProps={{
                    actionBar: {
                      actions: [],
                    },
                  }}
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{ borderRadius: 2, borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <StaticDateTimePicker
                  value={currentEndDate}
                  onChange={setCurrentEndDate}
                  views={["year","month","day","hours","minutes","seconds"]}
                  slotProps={{
                    actionBar: {
                      actions: [],
                    },
                  }}
                />
              </Paper>
            </>
          ) : (
            <>
              <DateTimePicker
                label="开始时间"
                value={currentStartDate}
                onChange={setCurrentStartDate}
                format="YYYY-MM-DD HH:mm:ss"
                views={["year","month","day","hours","minutes","seconds"]}
                timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                slotProps={{ textField: { placeholder: '开始时间', inputProps: { readOnly: true } } }}
              />
              <DateTimePicker
                label="结束时间"
                value={currentEndDate}
                onChange={setCurrentEndDate}
                format="YYYY-MM-DD HH:mm:ss"
                views={["year","month","day","hours","minutes","seconds"]}
                timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
                slotProps={{ textField: { placeholder: '结束时间', inputProps: { readOnly: true } } }}
              />
            </>
          )}
        </Stack>

        {dateError && (
          <FormHelperText error sx={{ px: 2 }}>
            结束时间必须要大于等于开始时间
          </FormHelperText>
        )}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={handleReset}>
          清空
        </Button>
        <Button variant="outlined" color="inherit" onClick={handleCancel}>
          取消
        </Button>
        <Button disabled={error} variant="contained" onClick={handleApply}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
