import type { ICalendarEvent } from 'src/types/calendar';

import { z as zod } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import type { ModelsRebaseRateQueue } from 'src/types/rebase';

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
  rate: zod
    .string()
    .min(1, { message: '利率必填' })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0 && Number(val) < 1, {
      message: '利率必须大于0且小于1',
    }),
});

// ----------------------------------------------------------------------

type Props = {
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentEvent: ModelsRebaseRateQueue;
};

export function PledgeForm({ currentEvent, onClose, onSubmit: handleSubmitForm }: Props) {
  const [bonds, setBonds] = useState<BondData[]>([]);

  // 获取债券列表数据
  const fetchBondData = async () => {
    try {
      const response = await getBondIndexAPI({});

      console.log('response获取债券列表', response);
      if (response.data) {
        const bondData =  response.data.list;
        // 按照ID进行升序排序
        setBonds(bondData);
      }
    } catch (error) {
      console.error('获取债券列表失败:', error);
      toast.error('获取债券列表失败!');
    }
  };

  // // 组件加载时获取数据
  // useEffect(() => {
  //   fetchBondData();
  // }, []);

  const methods = useForm<EventSchemaType>({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: {
      rate: currentEvent?.rate?.toString() || '',
    },
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = {
        rate: Number(data.rate),
      };

      await handleSubmitForm(formData);
      onClose();
      reset();
    } catch (error) {
      console.error(error);
      toast.error('提交失败');
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text name="rate" label="Rebase利率" multiline rows={1} />
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
