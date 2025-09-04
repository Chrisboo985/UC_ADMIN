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

import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

const createResetPasswordSchema = (needSurety: boolean) => zod.object({
  login_pass: zod
    .string()
    .min(6, { message: '登录密码至少6位' })
    .max(50, { message: '登录密码不能超过50个字符' }),
  true_pass: zod
    .string()
    .min(6, { message: '交易密码至少6位' })
    .max(50, { message: '交易密码不能超过50个字符' }),
  surety: needSurety 
    ? zod.string().min(1, { message: '担保人信息不能为空' })
    : zod.string().optional(),
});

export const ResetPasswordSchema = zod.object({
  login_pass: zod
    .string()
    .min(6, { message: '登录密码至少6位' })
    .max(50, { message: '登录密码不能超过50个字符' }),
  true_pass: zod
    .string()
    .min(6, { message: '交易密码至少6位' })
    .max(50, { message: '交易密码不能超过50个字符' }),
  surety: zod
    .string()
    .optional(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: { id: number; login_pass: string; true_pass: string; surety: string }) => void;
  currentUser: IUserItemforlist;
};

export function ResetPasswordForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  // 判断是否需要显示担保人输入框（等级5或以上不需要）
  const needSurety = !currentUser.calc_level || currentUser.calc_level < 5;

  const dynamicSchema = createResetPasswordSchema(needSurety);
  
  const methods = useForm<ResetPasswordSchemaType>({
    mode: 'all',
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      login_pass: '',
      true_pass: '',
      surety: '',
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
        login_pass: data.login_pass,
        true_pass: data.true_pass,
        surety: needSurety && data.surety ? data.surety : '',
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
      <DialogTitle sx={{ minHeight: 60 }}>
        重置密码
      </DialogTitle>

      <DialogContent sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                用户信息
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  bgcolor: 'grey.100',
                  p: 1,
                  borderRadius: 1,
                  wordBreak: 'break-all',
                  fontSize: '0.875rem'
                }}
              >
                ID: {currentUser.id} | 地址: {currentUser.address || '未设置'}
              </Typography>
            </Box>

            <Field.Text
              name="login_pass"
              label="新登录密码"
              type="password"
              placeholder="请输入新的登录密码（6-50位）"
            />

            <Field.Text
              name="true_pass"
              label="新交易密码"
              type="password"
              placeholder="请输入新的交易密码（6-50位）"
            />

            {needSurety && (
              <>
                <Field.Text
                  name="surety"
                  label="担保人"
                  placeholder="请输入担保人编码或地址"
                  required={needSurety}
                />
              </>
            )}
          </Stack>

          <DialogActions sx={{ px: 0, pb: 1, mt: 'auto' }}>
            <Button variant="outlined" onClick={handleClose}>
              取消
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={isSubmitting}
            >
              确认重置
            </LoadingButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </>
  );
}
