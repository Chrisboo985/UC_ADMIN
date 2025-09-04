import { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Stack from '@mui/material/Stack';

import { Form as FormProvider, RHFTextField } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';
import { updateFixCommunityScoreAPI } from 'src/api/user';

// ----------------------------------------------------------------------

interface IProps {
  open: boolean;
  onClose: VoidFunction;
  currentUser: {
    id: number;
    address?: string;
    fix_community_score?: number;
  };
  onSuccess?: VoidFunction;
  refreshList?: VoidFunction;
}

type FormValuesProps = {
  fix_community_score: number;
};

export function FixCommunityScoreForm({ open, onClose, currentUser, onSuccess, refreshList }: IProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const FixCommunityScoreSchema = Yup.object().shape({
    fix_community_score: Yup.number()
      .required('社区分数不能为空')
      .typeError('请输入有效数字'),
      // 移除最小值限制，允许负数
  });

  // 初始默认值
  const defaultValues = {
    fix_community_score: 0,
  };

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(FixCommunityScoreSchema),
    defaultValues,
  });
  
  const {
    reset,
    handleSubmit,
    formState: { isSubmitting: formIsSubmitting },
  } = methods;
  
  // 在对话框打开和当前用户变化时重置表单值
  useEffect(() => {
    if (open && currentUser) {
      console.log('当前用户的社区分数值:', currentUser.fix_community_score);
      reset({
        fix_community_score: currentUser.fix_community_score ?? 0
      });
    }
  }, [open, currentUser, reset]);

  const onSubmit = async (data: FormValuesProps) => {
    try {
      setIsSubmitting(true);
      const apiData = {
        id: currentUser.id,
        fix_community_score: data.fix_community_score, // 0是有效值
      };

      const result = await updateFixCommunityScoreAPI(apiData);

      if (result.code === 0) {
        toast.success('修改社区分数成功');
        onSuccess?.();
        onClose();
        reset();
      } else {
        toast.error(result.message || '修改社区分数失败');
      }
    } catch (error) {
      console.error('修改社区分数出错:', error);
      toast.error('修改社区分数失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>修改社区分数</DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {currentUser.address && (
              <Box sx={{ typography: 'body2', color: 'text.secondary' }}>
                地址: {currentUser.address}
              </Box>
            )}

            <RHFTextField
              name="fix_community_score"
              label="社区分数"
              placeholder="请输入社区分数"
              type="number"
              // 移除min属性限制，允许负数输入
              InputProps={{
                inputProps: { },
                // 移除defaultValue属性，避免与React Hook Form的值管理冲突
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" variant="outlined" onClick={onClose}>
            取消
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting || formIsSubmitting}
          >
            保存
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
