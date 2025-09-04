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

import { Iconify } from 'src/components/iconify';

import { Scrollbar } from 'src/components/scrollbar';
import { Form, Field } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export type AddressFormType = zod.infer<typeof AddressFormSchema>;

const createAddressFormSchema = (needSurety: boolean) => zod.object({
  new_address: zod.string(),
  surety: needSurety 
    ? zod.string().min(1, { message: '担保人信息不能为空' })
    : zod.string().optional(),
});

export const AddressFormSchema = zod.object({
  new_address: zod.string(),
  surety: zod.string().optional(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: { id: number; new_address: string; surety: string }) => void;
  currentUser: IUserItemforlist;
};

export function AddressForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  // 判断是否需要显示担保人输入框（等级5或以上不需要）
  const needSurety = !currentUser.calc_level || currentUser.calc_level < 5;

  const dynamicSchema = createAddressFormSchema(needSurety);
  
  const methods = useForm<AddressFormType>({
    mode: 'all',
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      new_address: '',
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
        new_address: data.new_address,
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
      <DialogTitle sx={{ minHeight: 60, }}>
        地址换绑
      </DialogTitle>
      
      <DialogContent sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', minHeight: 100 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                当前地址
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
                {currentUser.address || '未设置'}
              </Typography>
            </Box>
            
            <Field.Text
              name="new_address"
              label="新地址（留空解绑）"
              type="text"
              placeholder="输入新地址或留空解绑"
            />
            
            {needSurety && (
              <Field.Text
                name="surety"
                label="担保人"
                placeholder="请输入担保人编码或地址"
                required={needSurety}
              />
            )}
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
