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
import { type UserTypeItem } from '../user/view/user-list-view.types'
import {
  UserType
} from 'src/api/user';

// ----------------------------------------------------------------------

export type AddressFormType = zod.infer<typeof AddressFormSchema>;

const createAddressFormSchema = (needSurety: boolean) => zod.object({
  type: zod.string()
});

export const AddressFormSchema = zod.object({
  type: zod.string(),
});

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: (data: { member_id: number; type: UserType; }) => void;
  currentUser: IUserItemforlist;
  items: UserTypeItem[];
};

export function AddressForm({ currentUser, open, onClose, onSubmitSuccess, items }: Props) {
  // 判断是否需要显示担保人输入框（等级5或以上不需要）
  const needSurety = !currentUser.calc_level || currentUser.calc_level < 5;

  const dynamicSchema = createAddressFormSchema(needSurety);

  const methods = useForm<AddressFormType>({
    mode: 'all',
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      type: currentUser.type as unknown as UserType,
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
        member_id: currentUser.id!,
        type: data.type as UserType,
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
        设置用户类型
      </DialogTitle>

      <DialogContent sx={{ p: 2, pb: 0, display: 'flex', flexDirection: 'column', minHeight: 100 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Field.RadioGroup row name="type" options={ items }>
            </Field.RadioGroup>
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
