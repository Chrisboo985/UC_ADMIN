import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import { toast } from 'src/components/snackbar';

import { LoadingButton } from '@mui/lab';
import { Form as FormProvider, RHFSelect } from 'src/components/hook-form';
import type { IUserItemforlist } from 'src/types/user';
import { updateScoreWhiteAPI, IsScoreWhite } from 'src/api/user';

interface UserScoreWhiteFormProps {
  currentUser: IUserItemforlist;
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (status: IsScoreWhite) => void;
}

export default function UserScoreWhiteForm({ 
  currentUser, 
  open, 
  onClose, 
  onSubmitSuccess 
}: UserScoreWhiteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const schema = Yup.object().shape({
    is_score_white: Yup.string().required('请选择积分白名单状态'),
  });

  const defaultValues = useCallback(() => ({
    is_score_white: (currentUser as any).is_score_white as IsScoreWhite || IsScoreWhite.NonWhite,
  }), [currentUser]);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValues(),
  });

  const { reset, handleSubmit, formState: { errors, isSubmitting: formSubmitting } } = methods;
  
  useEffect(() => {
    if (open && currentUser) {
      reset(defaultValues());
    }
  }, [currentUser, open, reset, defaultValues]);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      
      const response = await updateScoreWhiteAPI({
        id: currentUser.id,
        is_score_white: data.is_score_white,
      });
      
      if (response.code === 0) {
        toast.success('积分白名单状态更新成功');
        onSubmitSuccess(data.is_score_white);
      } else {
        toast.error(response.message || '积分白名单状态更新失败');
      }
    } catch (error: any) {
      console.error('更新积分白名单状态失败:', error);
      toast.error(`更新失败: ${error.message || '请稍后再试'}`);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };
  
  if (!currentUser) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="xs"
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>设置积分白名单状态</DialogTitle>
        
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
                    <strong>备注:</strong>
                  </Box>
                  <Box>{currentUser?.remark || '-'}</Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Box sx={{ minWidth: 120, mr: 2 }}>
                    <strong>会员类型:</strong>
                  </Box>
                  <Box>
                    {(currentUser as any)?.type === 1 ? '默认' : (currentUser as any)?.type === 2 ? '运营中心' : (currentUser as any)?.type === 3 ? '社区' : '-'}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  <Box sx={{ minWidth: 120, mr: 2 }}>
                    <strong>当前状态:</strong>
                  </Box>
                  <Box>
                    {(currentUser as any)?.is_score_white === IsScoreWhite.White ? '白名单' : '非白名单'}
                  </Box>
                </Box>
              </Box>

              <RHFSelect
                name="is_score_white"
                label="积分白名单状态"
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={IsScoreWhite.White}>白名单</MenuItem>
                <MenuItem value={IsScoreWhite.NonWhite}>非白名单</MenuItem>
              </RHFSelect>
            </Stack>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} color="inherit" variant="outlined">
            取消
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting || formSubmitting}>
            保存
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
