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
import {
  type ConfirmNodeSubscriptionRequest,
  getProductList,
  type GetProductListResponse
} from 'src/api/user';
import MenuItem from '@mui/material/MenuItem';
import React from 'react'

// ----------------------------------------------------------------------

export type ResetPasswordSchemaType = zod.infer<typeof ResetPasswordSchema>;

const createResetPasswordSchema = () => zod.object({
  hash: zod
    .string()
    .refine(value => value, { message: '请输入订单哈希/订单号' }),
  product_id: zod
    .number()
    .refine(value => value !== Infinity, { message: '请选择产品' }),
  quantity: zod
    .number()
    .refine(value => value, { message: '请输入数量' }),
});

export const ResetPasswordSchema = zod.object({
  hash: zod
    .string()
    .refine(value => value, { message: '请输入订单哈希/订单号' }),
  product_id: zod
    .number()
    .refine(value => value !== Infinity, { message: '请选择产品' }),
  quantity: zod
    .number()
    .refine(value => value >= 1, { message: '请输入数量' }),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: ConfirmNodeSubscriptionRequest) => void;
  currentUser: IUserItemforlist;
};

export function ResetPasswordForm({ currentUser, open, onClose, onSubmitSuccess }: Props) {
  const [productList, setProductList] = React.useState<GetProductListResponse>([])
  const dynamicSchema = createResetPasswordSchema();

  const methods = useForm<ResetPasswordSchemaType>({
    mode: 'all',
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      hash: '',
      product_id: Infinity,
      quantity: 1,
    },
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async ({ hash, product_id, quantity }) => {
    try {
      const submitData: ConfirmNodeSubscriptionRequest = {
        address: currentUser.address!,
        hash,
        product_id: product_id!,
        quantity,
        tx_at: Math.floor(Date.now() / 1000),
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

  React.useEffect(
    () => {
      ~(async () => {
        try {
          const res = await getProductList()

          const { code, data } = res

          if (code !== 0) return
          setProductList(data)
        } catch(error) {}
      })()
    },
    []
  )

  if (!open) return null;

  return (
    <>
      <DialogTitle sx={{ minHeight: 60 }}>
        节点认购
      </DialogTitle>

      <DialogContent sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                认购用户地址
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
              name="hash"
              label="订单哈希/订单号"
              type="text"
              placeholder="请输入订单哈希/订单号"
            />

            <Field.Select
              name="product_id"
              label="产品"
              type="text"
              placeholder="请选择产品"
            >
              <MenuItem value={ Infinity } disabled>暂未选择产品</MenuItem>
              { productList.map(({ id, name }) => (
                <MenuItem key={ id } value={ id }>
                  { name }
                  </MenuItem>
                ))
              }
            </Field.Select>

            <Field.Text
              name="quantity"
              label="数量"
              type="number"
              placeholder="请输入数量"
            />
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
              确认
            </LoadingButton>
          </DialogActions>
        </Form>
      </DialogContent>
    </>
  );
}
