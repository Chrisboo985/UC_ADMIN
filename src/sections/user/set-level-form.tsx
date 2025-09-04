import { useState } from 'react';
import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  MenuItem,
  Button,
  Stack,
  Box,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

import { Form, Field } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { updateLevelAPI } from 'src/api/user';

// ----------------------------------------------------------------------

const SetLevelFormSchema = zod.object({
  p_level: zod.string().min(1, '请选择P等级'),
  s_level: zod.string().min(1, '请选择S等级'),
});

type SetLevelFormType = zod.infer<typeof SetLevelFormSchema>;

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentUser: {
    id?: string;
    member_code?: string;
    virtual_level?: number;
    star_level?: number;
  };
};

// P等级选项 p0-p5 (值0-5) 和 d1-d5 (值6-10)
const P_LEVEL_OPTIONS = [
  ...Array.from({ length: 6 }, (_, i) => ({
    value: `${i}`,
    label: `p${i}`,
  })),
  ...Array.from({ length: 5 }, (_, i) => ({
    value: `${i + 6}`,
    label: `d${i + 1}`,
  }))
];

// S等级选项 s1-s10 (值0-10)
const S_LEVEL_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  value: `${i}`,
  label: `s${i}`,
}));

export function SetLevelForm({ open, onClose, onSuccess, currentUser }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<SetLevelFormType>({
    resolver: zodResolver(SetLevelFormSchema),
    defaultValues: {
      p_level: currentUser.virtual_level?.toString() || '',
      s_level: currentUser.star_level?.toString() || '',
    },
  });

  const { handleSubmit, reset } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const loadingToast = toast.loading('正在设置等级...');
    try {
      setIsSubmitting(true);
      const result = await updateLevelAPI({
        id: Number(currentUser.id),
        star_level: Number(data.s_level),
        virtual_level: Number(data.p_level),
      });

      if (result.code === 0) {
        toast.success('设置等级成功');
        onSuccess?.();
        handleClose();
      } else {
        toast.error(result.message || '设置等级失败请重试');
      }
    } catch (error) {
      console.error('设置等级失败:', error);
      toast.error('设置等级失败请重试');
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>设置等级</DialogTitle>

      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                当前用户编码
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem'
                }}
              >
               {currentUser.member_code || '-'}
              </Typography>
            </Box>

            {/* P等级选择 */}
            <Field.Select
              name="p_level"
              label="设置P等级"
              placeholder="请选择P等级"
            >
              {P_LEVEL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            {/* S等级选择 */}
            <Field.Select
              name="s_level"
              label="设置S等级"
              placeholder="请选择S等级"
            >
              {S_LEVEL_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>
          </Stack>
        </Form>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          取消
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          loading={isSubmitting}
          onClick={onSubmit}
        >
          确认
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
