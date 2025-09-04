import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  Button,
  Radio,
  RadioGroup,
  TextField,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
  Stack,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { airdropTcashAPI } from 'src/api/lgns';

const FLAME_TYPES = [
  { value: 'dividend_rewards', label: '分红奖励' },
  { value: 'guild_subsidies', label: '社区补贴' },
  { value: 'governance', label: '治理' },
  { value: 'airdrop_rewards', label: '空投奖励' },
  { value: 'exclusive_events', label: '专属活动' },
];

interface FormValues {
  amount: number;
  distributeType: 'byType' | 'manual';
  flameType?: string;
  addresses?: string;
  fieldType: 'nft_reward_amount' | 'plane_key_amount';
}

export default function AirdropTcashForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [pendingFormValues, setPendingFormValues] = useState<FormValues | null>(null);

  const { control, handleSubmit, watch, setValue, formState } = useForm<FormValues>({
    defaultValues: {
      distributeType: 'byType',
      amount: 0,
      fieldType: 'nft_reward_amount',
    },
  });

  const distributeType = watch('distributeType');
  const fieldType = watch('fieldType');

  const handlePasswordConfirm = async () => {
    if (!pendingFormValues) return;
    
    setOpenPasswordDialog(false);
    try {
      setLoading(true);
      setError('');
      setSuccess(false);

      const params = {
        amount: pendingFormValues.amount,
        asset_type: pendingFormValues.fieldType,
        password,
        ...(pendingFormValues.distributeType === 'byType'
          ? { type: pendingFormValues.flameType }
          : {
              accounts: pendingFormValues.addresses
                ?.split('\n')
                .map((addr) => addr.trim())
                .filter(Boolean),
            }),
      };
      // @ts-ignore
      const { code, data, message } = await airdropTcashAPI(params);
      if (code === 0) {
        setSuccess(true);
        // 调用成功回调
        onSuccess?.();
      } else {
        setError(message || '空投失败');
      }
    } catch (err) {
      setError(err.message || '操作异常');
    } finally {
      setLoading(false);
      setPassword('');
      setPendingFormValues(null);
      setTimeout(() => {
        setSuccess(false);
      }, 2000);
    }
  };

  const handlePasswordCancel = () => {
    setOpenPasswordDialog(false);
    setPassword('');
    setPendingFormValues(null);
    setLoading(false);
  };

  const onSubmit = async (values: FormValues) => {
    setPendingFormValues(values);
    setOpenPasswordDialog(true);
  };

  useEffect(() => {
    setValue('addresses', '');
    setValue('flameType', undefined);
  }, [distributeType]);

  return (
    <Box sx={{ p: 3 }}>
      {/* <Typography variant="h6" sx={{ mb: 3 }}>
        TCASH空投
      </Typography> */}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>


          {/* 字段类型选择 */}
          <Controller
            name="fieldType"
            control={control}
            rules={{ required: '请选择字段类型' }}
            render={({ field, fieldState }) => (
              <FormControl error={!!fieldState.error}>
                <RadioGroup {...field} row>
                  <FormControlLabel value="nft_reward_amount" control={<Radio />} label="TCASH" />
                  <FormControlLabel value="plane_key_amount" control={<Radio />} label="宝石" />
                </RadioGroup>
                {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
              </FormControl>
            )}
          />

          {/* 发放金额 */}
          <Controller
            name="amount"
            control={control}
            rules={{
              required: '请输入发放金额',
              min: { value: 0.000001, message: '金额必须大于0' },
              max: { value: 50, message: '金额不能超过50' },
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                type="number"
                label="发放金额"
                InputProps={{
                  endAdornment: <InputAdornment position="end">{fieldType === 'nft_reward_amount' ? 'TCASH' : '宝石'}</InputAdornment>,
                }}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* 发放方式 */}
          <Controller
            name="distributeType"
            control={control}
            render={({ field }) => (
              <FormControl>
                <RadioGroup {...field} row>
                  <FormControlLabel value="byType" control={<Radio />} label="按条件发放" />
                  <FormControlLabel value="manual" control={<Radio />} label="手动批量发放" />
                </RadioGroup>
              </FormControl>
            )}
          />


          {/* 条件选择或地址输入 */}
          {distributeType === 'byType' ? (
            <Controller
              name="flameType"
              control={control}
              rules={{ required: '请选择发放条件' }}
              render={({ field, fieldState }) => (
                <FormControl error={!!fieldState.error}>
                  <RadioGroup {...field}>
                    {FLAME_TYPES.map((type) => (
                      <FormControlLabel
                        key={type.value}
                        value={type.value}
                        control={<Radio />}
                        label={type.label}
                      />
                    ))}
                  </RadioGroup>
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          ) : (
            <Controller
              name="addresses"
              control={control}
              rules={{ required: '请输入钱包地址' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  multiline
                  rows={4}
                  label="钱包地址"
                  placeholder="每行输入一个钱包地址"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message || '请每行输入一个钱包地址'}
                />
              )}
            />
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              空投操作已成功执行
            </Alert>
          )}

          {/* 
          <LoadingButton loading={loading} type="submit" variant="contained" size="large">
            确认空投
          </LoadingButton> */}
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="outlined" onClick={onCancel}>
              取消
            </Button>
            <LoadingButton loading={loading} type="submit" variant="contained">
              确认空投
            </LoadingButton>
          </Stack>
        </Stack>
      </form>

      <Dialog open={openPasswordDialog} onClose={handlePasswordCancel}>
        <DialogTitle>请输入密码确认操作</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="密码"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handlePasswordCancel}>取消</Button>
          <LoadingButton 
            loading={loading} 
            onClick={handlePasswordConfirm}
            disabled={!password}
          >
            确认
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
