import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form, Field } from 'src/components/hook-form';
import { Scrollbar } from 'src/components/scrollbar';
import type { IUserItemforlist } from 'src/types/user';

// ----------------------------------------------------------------------

export type FormSchemaType = zod.infer<typeof FormSchema>;
export const FormSchema = zod.object({
  ck_purchase_max_times: zod.string().refine(
    (val) => {
      const num = Number(val.trim());
      return (
        !Number.isNaN(num) &&
        Number.isInteger(num) &&
        num > 0
      );
    },
    { message: '请输入大于0的正整数' }
  ),
});

// ----------------------------------------------------------------------

type Props = {
  onClose: () => void;
  onSuccess: (data: { member_id: number; ck_purchase_max_times: number }) => void;
  currentEvent: any;
};

export function CkBuyNumForm({ currentEvent, onClose, onSuccess }: Props) {
  const methods = useForm<FormSchemaType>({
    mode: 'all',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      ck_purchase_max_times: currentEvent.ck_purchase_max_times,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      onSuccess({
        member_id: currentEvent.id,
        ck_purchase_max_times: Number(data.ck_purchase_max_times.trim()),
      });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Scrollbar sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Field.Text
            name="ck_purchase_max_times"
            label="最大可购买CK码数量"
            multiline
            rows={1}
            inputProps={{
              type: 'number',
              step: '0.0000000001',
              min: 0,
              pattern: '^[0-9]+(\\.[0-9]{1,10})?$',
            }}
          />
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
