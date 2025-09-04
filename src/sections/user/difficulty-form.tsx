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
  difficulty: zod.string().refine(
    (val) => {
      const num = Number(val.trim());
      return (
        !Number.isNaN(num) &&
        num >= 0.1 &&
        num <= 1 &&
        // 验证小数位数不超过1位
        !/\.\d{2,}/.test(val)
      );
    },
    { message: '请输入0.1-1之间的数字，最多支持1位小数' }
  ),
});

// ----------------------------------------------------------------------

type Props = {
  onClose: () => void;
  onSuccess: (data: { member_id: number; difficulty: number }) => void;
  currentEvent: any;
};

export function DifficultyForm({ currentEvent, onClose, onSuccess }: Props) {
  const methods = useForm<FormSchemaType>({
    mode: 'all',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      difficulty: currentEvent.difficulty,
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
        difficulty: Number(data.difficulty.trim()),
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
            name="difficulty"
            label="游戏难度系数"
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
