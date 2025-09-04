import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { toast } from 'sonner';
// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentRate?: number;
  onSuccess: (r:number) => Promise<void>;
  max?: number;
};

export default function EditRateDialog({ max, open, onClose, onSuccess, currentRate = 0 }: Props) {
  const [rate, setRate] = useState(currentRate);
  
  function handleSuccess() {
    if (max) {
      if (rate < 0) {
        toast.error('DAO奖励率不能小于0');
        return;
      }
      if (rate > max) {
        toast.error(`DAO奖励率不能大于${max}`);
        return;
      }
    }
    onSuccess(rate).finally(onClose)
  }
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>修改 DAO 奖励率</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="DAO奖励率"
          defaultValue={currentRate}
          type="number"
          inputProps={{ min: 0, max, step: 'any' }}
          onBlur={e => setRate(Number(e.target.value))}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
        <Button onClick={handleSuccess} variant="contained">
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
