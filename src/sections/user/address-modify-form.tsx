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
import Alert from '@mui/material/Alert';

import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type AddressModifySchemaType = zod.infer<typeof AddressModifySchema>;

// 钱包地址验证规则
export const AddressModifySchema = zod.object({
  new_address: zod
    .string()
    .min(1, { message: '新地址不能为空' })
    .regex(/^[a-zA-Z0-9]+$/, { message: '地址格式不正确，只能包含字母和数字' })
    .min(20, { message: '地址长度至少20位' })
    .max(100, { message: '地址长度不能超过100位' }),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: { id: number; new_address: string }) => void;
  currentUser: IUserItemforlist;
};

export function AddressModifyForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  const methods = useForm<AddressModifySchemaType>({
    mode: 'all',
    resolver: zodResolver(AddressModifySchema),
    defaultValues: {
      new_address: '',
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const submitData = {
        id: currentUser.id!,
        new_address: data.new_address.trim(),
      };
      
      onSubmitSuccess(submitData);
      reset();
    } catch (error) {
      console.error(error);
    }
  });

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  if (!open) return null;

  return (
    <>
      <DialogTitle sx={{ minHeight: 76 }}>
        换绑钱包地址
      </DialogTitle>
      
      <DialogContent>
        <Form methods={methods} onSubmit={onSubmit}>
          <Scrollbar sx={{ pt: 2 }}>
            <Stack spacing={3}>
              <Alert severity="info" sx={{ mb: 2 }}>
                当前用户：{currentUser.address || '未知地址'}
              </Alert>

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  当前钱包地址
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.100', 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    wordBreak: 'break-all'
                  }}
                >
                  {currentUser.address || '未绑定地址'}
                </Typography>
              </Box>
              
              <Field.Text
                name="new_address"
                label="新钱包地址"
                placeholder="请输入新的钱包地址"
                helperText="输入新的钱包地址来替换当前地址，留空表示解绑当前地址"
                multiline
                rows={2}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  }
                }}
              />

              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>注意：</strong>
                  <br />
                  • 这是一个高风险操作，请谨慎操作
                </Typography>
              </Alert>
            </Stack>
          </Scrollbar>

          <DialogActions sx={{ flexShrink: 0, mt: 3 }}>
            <Button variant="outlined" color="inherit" onClick={handleClose}>
              取消
            </Button>

            <LoadingButton type="submit" variant="contained" loading={isSubmitting} color="warning">
              确认换绑
            </LoadingButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </>
  );
}
