import { z as zod } from 'zod';
import { useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { IUserItemforlist } from 'src/types/user';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';

import { toast } from 'src/components/snackbar';
import { Form, Field } from 'src/components/hook-form';
import { updateParentIdAPI } from 'src/api/user';

// ----------------------------------------------------------------------

export type ChangeSuperiorFormType = zod.infer<typeof ChangeSuperiorFormSchema>;

export const ChangeSuperiorFormSchema = zod.object({
  parent_code: zod.string().min(1, '新上级编码不能为空').refine(
    (val) => {
      return /^AP_\d+$/.test(val);
    },
    {
      message: '上级编码必须以AP_开头',
    }
  ),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: { id: number; parent_code: string | null }) => void;
  currentUser: IUserItemforlist;
};

export function ChangeSuperiorForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {

  const methods = useForm<ChangeSuperiorFormType>({
    mode: 'all',
    resolver: zodResolver(ChangeSuperiorFormSchema),
    defaultValues: {
      parent_code: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    const toastId = toast.loading('正在更改上级...');
    try {
      const submitData = {
        id: currentUser.id!,
        parent_code: data.parent_code,
      };

      const result = await updateParentIdAPI(submitData);

      // 检查响应是否成功 (code为0表示成功)
      if (result.code === 0) {
        toast.success('更改上级成功');
        onSubmitSuccess(submitData);
        reset();
        onClose();
      } else {
        toast.error(result.message || '更改上级失败请重试');
      }
    } catch (error) {
      console.error(error);
      toast.error('更改上级失败请重试');
    } finally {
      toast.dismiss(toastId);
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  if (!open) return null;

  return (
    <>
      <DialogTitle sx={{ minHeight: 60 }}>
        更改上级
      </DialogTitle>

      <DialogContent sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                当前上级地址
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  fontSize: '0.875rem',
                  wordBreak: 'break-all'
                }}
              >
               {currentUser.parent_address || '暂无上级'}
              </Typography>
            </Box>



            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                新上级编码（必填）
              </Typography>
              <Field.Text
                name="parent_code"
                placeholder="请输入新上级的用户编码（以AP_开头）"
                inputProps={{
                  maxLength: 50,
                }}
              />
            </Box>
          </Stack>

          <DialogActions sx={{ px: 0, pb: 2, mt: 'auto' }}>
            <Button variant="outlined" onClick={handleClose}>
              取消
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              确认
            </LoadingButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </>
  );
}
