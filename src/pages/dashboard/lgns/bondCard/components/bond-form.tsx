import { z as zod } from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import { BondData } from 'src/api/lgns';

import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type EventSchemaType = zod.infer<typeof EventSchema>;

export const EventSchema = zod.object({
  name: zod.string().min(1, { message: '债券名称必填' }),
  contract_address: zod.string().optional(),
  new_contract_address: zod.string().optional(),
  discount: zod
    .string()
    .min(1, { message: '折扣必填' })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 1, {
      message: '折扣必须在0到1之间',
    }),
  release_cycle: zod
    .string()
    .min(1, { message: '释放周期必填' })
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0, {
      message: '释放周期必须大于或等于0',
    }),
  status: zod.enum(['enable', 'disable'], {
    message: '状态必须是 enable 或 disable',
  }),
  type: zod.enum(['1', '2'], {
    message: '债券类型必须是 1(活期债券) 或 2(长期债券)',
  }),
  business_type: zod.enum(['1', '2'], {
    message: '业务类型必须是 1(国库) 或 2(LP)',
  }),
}).refine(
  (data) => !!data.contract_address || !!data.new_contract_address, 
  {
    message: "必须填写合约地址或新合约地址其中一个",
    path: ["contract_address"], // 错误显示在 contract_address 字段下
  }
);

// ----------------------------------------------------------------------

type Props = {
  onClose: () => void;
  onSubmit: (data: any) => void;
  currentEvent: BondData;
};

export function BondForm({ currentEvent, onClose, onSubmit: handleSubmitForm }: Props) {
  const [statusEnabled, setStatusEnabled] = useState(
    currentEvent?.status === 'enable'
  );

  const methods = useForm<EventSchemaType>({
    mode: 'all',
    resolver: zodResolver(EventSchema),
    defaultValues: {
      name: currentEvent?.name || '',
      contract_address: currentEvent?.contract_address || '',
      new_contract_address: currentEvent?.new_contract_address || '',
      discount: currentEvent?.discount?.toString() || '',
      release_cycle: currentEvent?.release_cycle?.toString() || '',
      status: (currentEvent?.status as 'enable' | 'disable') || 'disable',
      type: currentEvent?.type?.toString() as '1' | '2' || '1',
      business_type: currentEvent?.business_type?.toString() as '1' | '2' || '1',
    },
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const formData = {
        name: data.name,
        contract_address: data.contract_address || undefined,
        new_contract_address: data.new_contract_address || undefined,
        discount: Number(data.discount),
        release_cycle: Number(data.release_cycle),
        status: data.status,
        type: Number(data.type),
        business_type: Number(data.business_type),
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
          <Field.Text name="name" label="债券名称" />
          
          <Field.Text name="contract_address" label="合约地址" helperText="必须填写合约地址或新合约地址其中一个" />
          
          <Field.Text name="new_contract_address" label="新合约地址" helperText="必须填写合约地址或新合约地址其中一个" />
          
          <Field.Select name="business_type" label="业务类型">
            <MenuItem value="1">国库</MenuItem>
            <MenuItem value="2">LP</MenuItem>
          </Field.Select>
          
          <Field.Select name="type" label="债券类型">
            <MenuItem value="1">活期债券</MenuItem>
            <MenuItem value="2">长期债券</MenuItem>
          </Field.Select>
          
          <Field.Text 
            name="discount" 
            label="折扣" 
            placeholder="请输入0到1之间的数值"
            InputProps={{
              inputProps: { min: 0, max: 0.999, step: 0.001 },
              type: "number",
            }}
          />
          
          <Field.Text 
            name="release_cycle" 
            label="释放周期(天)" 
            placeholder="请输入大于等于0的整数"
            InputProps={{
              inputProps: { min: 0, step: 1 },
              type: "number",
            }}
          />
          
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={statusEnabled}
                  onChange={(e) => {
                    setStatusEnabled(e.target.checked);
                    setValue('status', e.target.checked ? 'enable' : 'disable');
                  }}
                />
              }
              label={statusEnabled ? '启用' : '禁用'}
            />
            {/* Hidden field handled by setValue in the switch onChange */}
            <FormHelperText>切换开关设置债券状态</FormHelperText>
          </Box>
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
