import { useState, useEffect, useCallback } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import { IUserItemforlist } from 'src/types/user'; 
import { toast } from 'src/components/snackbar';
import { Form, RHFSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------

interface FormValuesProps {
  is_enable_scr_check: 'enable' | 'disable';
}

interface Props {
  currentUser: IUserItemforlist | null;
  open: boolean;
  onClose: VoidFunction;
  onSubmitSuccess: (permission: 'enable' | 'disable') => void;
}

export default function UserScrCheckAuthForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const AuthSchema = Yup.object().shape({
    is_enable_scr_check: Yup.mixed<'enable' | 'disable'>()
      .oneOf(['enable', 'disable'], '必须是启用或禁用')
      .required('请选择SCR检测权限'),
  });

  const defaultValues = useCallback(() => ({
    is_enable_scr_check: currentUser?.is_enable_scr_check || 'disable',
  }), [currentUser]);

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(AuthSchema),
    defaultValues: defaultValues(),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (open && currentUser) {
      reset(defaultValues());
    }
  }, [currentUser, open, reset, defaultValues]);

  const onSubmit = async (data: FormValuesProps) => {
    setLoading(true);
    try {
      await onSubmitSuccess(data.is_enable_scr_check);
      onClose();
    } catch (error) {
      console.error('提交SCR检测权限表单时发生错误:', error);
      toast.error('修改SCR检测权限失败');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>修改SCR检测权限</DialogTitle>

      <DialogContent sx={{ overflow: 'unset' }}>
        <Box sx={{ p: 1 }}>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>用户地址:</strong>
                </Box>
                <Box>{currentUser?.address || '-'}</Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>用户ID:</strong>
                </Box>
                <Box>{currentUser?.id || '-'}</Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>总质押价值:</strong>
                </Box>
                <Box>{currentUser?.total_stake_usdt_amount !== undefined ? `${currentUser.total_stake_usdt_amount} USDT` : '-'}</Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>SCR阈值:</strong>
                </Box>
                <Box>{currentUser?.scr !== undefined ? `${currentUser.scr} USDT` : '-'}</Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>当前质押USDT:</strong>
                </Box>
                <Box>{currentUser?.current_stake_usdt !== undefined ? `${currentUser.current_stake_usdt} USDT` : '-'}</Box>
              </Box>
            </Box>

            <RHFSelect
              name="is_enable_scr_check"
              label="SCR检测权限"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="enable">启用</MenuItem>
              <MenuItem value="disable">禁用</MenuItem>
            </RHFSelect>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          取消
        </Button>

        <LoadingButton type="submit" variant="contained" loading={loading || isSubmitting}>
          保存
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}
