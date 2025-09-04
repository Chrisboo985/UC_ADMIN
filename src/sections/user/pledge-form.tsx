import type { ICalendarEvent } from 'src/types/calendar';

import { z as zod } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { IUserItemforlist, IUserTableFiltersForList } from 'src/types/user';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';

import { getBondIndexAPI, BondData } from 'src/api/lgns';
import { uuidv4 } from 'src/utils/uuidv4';
import { fIsAfter } from 'src/utils/format-time';

import { createEvent, updateEvent, deleteEvent } from 'src/actions/calendar';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';

// ----------------------------------------------------------------------

export type EventSchemaType = zod.infer<typeof EventSchema>;

export const EventSchema = zod.object({
  bondInputs: zod.record(
    zod.string().refine(
      (val) => {
        const num = Number(val);
        return (
          !Number.isNaN(num) &&
          num >= 0 &&
          num < 1 &&
          // 验证小数位数不超过10位
          !/\.\d{11,}/.test(val)
        );
      },
      { message: '请输入0-1之间的数字，最多支持10位小数' }
    )
  ),
});

// ----------------------------------------------------------------------

// 定义新的提交数据类型
type PledgeFormData = {
  bond_id: number;
  member_id: number;
  rate: number;
};

type Props = {
  onClose: () => void;
  onSuccess: (data: PledgeFormData[]) => void;
  bonds: BondData[];
  currentEvent: IUserItemforlist;
};

export function PledgeForm({ currentEvent, onClose, onSuccess, bonds }: Props) {
  // 处理默认值
  const getDefaultValues = () => {
    // 创建一个所有债券ID对应值为'0'的对象
    const defaultBondInputs = Object.fromEntries(bonds.map((bond) => [bond.id, '0']));

    // 如果存在 currentEvent.member_bond_rates，用其值覆盖默认值
    if (currentEvent.member_bond_rates && Array.isArray(currentEvent.member_bond_rates)) {
      currentEvent.member_bond_rates.forEach((rate) => {
        defaultBondInputs[rate.bond_id] = rate.rate.toString();
      });
    }

    return {
      bondInputs: defaultBondInputs,
    };
  };

  const methods = useForm<EventSchemaType>({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const formattedData = Object.entries(data.bondInputs).map(([bondId, rate]) => ({
      bond_id: Number(bondId),
      member_id: currentEvent.id,
      rate: Number(rate) || 0,
    }));

    console.log('提交的数据:', formattedData);

    try {
      onClose();
      reset();
      onSuccess(formattedData);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* 为每个债券创建输入框 */}
          {bonds.map((bond) => (
            <Field.Text
              key={bond.id}
              name={`bondInputs.${bond.id}`}
              label={`债券 ${bond.name || bond.id}`}
              multiline
              rows={1}
              inputProps={{
                type: 'number',
                step: '0.0000000001',
                defaultValue: 0,
                min: 0,
                max: 0.9999999999,
                pattern: '^0(\\.\\d{1,10})?$',
              }}
            />
          ))}
        </Stack>
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0 }}>
        <Box sx={{ flexGrow: 1 }} />

        <Button variant="outlined" color="inherit" onClick={onClose}>
          取消
        </Button>

        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
          保存
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}
