import { useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LoadingButton from '@mui/lab/LoadingButton';

import { toast } from 'src/components/snackbar';
import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

interface FormValuesProps {
  amount: number;
}

interface Props {
  currentUser: any;
  open: boolean;
  onClose: VoidFunction;
  onSubmitSuccess: (data: any) => void;
}

export function VerifyBondSellRewardForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const RemarkSchema = Yup.object().shape({
    amount: Yup.number().min(0).required('请输入奖励金额'),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RemarkSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    setLoading(true);
    try {
      // 格式化数据
      const formattedData = {
        amount: data.amount,
        id: currentUser.id,
      };

      // 调用回调函数处理数据
      await onSubmitSuccess(formattedData);

      // 重置表单并关闭
      onClose();
      reset();
    } catch (error) {
      console.error('提交核销债券销售奖励表单时发生错误:', error);
      toast.error('核销债券销售奖励失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <DialogTitle>核销债券销售奖励</DialogTitle>

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
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>待核销奖励:</strong>
                </Box>
                <Box>{currentUser?.unverified_bond_sell_reward || '0'}</Box>
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 120, mr: 2 }}>
                  <strong>已核销奖励:</strong>
                </Box>
                <Box>{currentUser?.verified_bond_sell_reward || '0'}</Box>
              </Box>
            </Box>

            <RHFTextField
              name="amount"
              label="奖励金额"
              placeholder="请输入需要核销的奖励金额"
              type="number"
              InputLabelProps={{ shrink: true }}
            />
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
