import { useState, useEffect } from 'react';
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

import { toast } from 'src/components/snackbar';
import { Form, RHFSelect } from 'src/components/hook-form';

// ----------------------------------------------------------------------

interface FormValuesProps {
  is_allow_bond_sell_reward: string;
}

interface Props {
  currentUser: any;
  open: boolean;
  onClose: VoidFunction;
  onSubmitSuccess: (data: any) => void;
}

export function UpdateBondSellRewardAuthForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const AuthSchema = Yup.object().shape({
    is_allow_bond_sell_reward: Yup.string().required('请选择债券销售奖励权限'),
  });

  // 创建form实例
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(AuthSchema),
    defaultValues: {
      is_allow_bond_sell_reward: currentUser?.is_allow_bond_sell_reward || 'allow',
    },
  });
  
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;
  
  // 当currentUser变化时更新表单
  useEffect(() => {
    if (currentUser?.is_allow_bond_sell_reward) {
      reset({
        is_allow_bond_sell_reward: currentUser.is_allow_bond_sell_reward
      });
    }
  }, [currentUser, reset]);

  const onSubmit = async (data: FormValuesProps) => {
    setLoading(true);
    try {
      // 格式化数据
      const formattedData = {
        id: currentUser.id,
        is_allow_bond_sell_reward: data.is_allow_bond_sell_reward,
      };

      // 调用回调函数处理数据
      await onSubmitSuccess(formattedData);

      // 重置表单并关闭
      onClose();
      reset();
    } catch (error) {
      console.error('提交修改债券销售奖励权限表单时发生错误:', error);
      toast.error('修改债券销售奖励权限失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>修改债券销售奖励权限</DialogTitle>

      <DialogContent>
        <Box sx={{ p: 1 }}>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>用户地址:</strong>
                </Box>
                <Box>{currentUser?.address || '-'}</Box>
              </Box>
            </Box>

            <RHFSelect
              name="is_allow_bond_sell_reward"
              label="债券销售奖励权限"
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value="allow">允许</MenuItem>
              <MenuItem value="disallow">不允许</MenuItem>
            </RHFSelect>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          取消
        </Button>

        <LoadingButton type="submit" variant="contained" loading={loading || isSubmitting}>
          提交
        </LoadingButton>
      </DialogActions>
    </Form>
  );
}
