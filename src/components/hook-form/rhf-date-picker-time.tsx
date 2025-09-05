import type { Dayjs } from 'dayjs';
import type { TextFieldProps } from '@mui/material/TextField';
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';

import dayjs from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

import { DateTimePicker, type DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';

import { formatStr } from 'src/utils/format-time';

// ----------------------------------------------------------------------

type RHFDateTimePickerTimeProps = DateTimePickerProps<Dayjs> & {
  name: string;
};

export function RHFDateTimePicker({ name, slotProps, ...other }: RHFDateTimePickerTimeProps) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DateTimePicker
          {...field}
          value={dayjs(field.value)}
          onChange={(newValue) => field.onChange(dayjs(newValue).format())}
          format="YYYY-MM-DD HH:mm:ss"
          views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
          ampm={false}
          timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
          slotProps={{
            ...slotProps,
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message ?? (slotProps?.textField as TextFieldProps)?.helperText,
              ...slotProps?.textField,
            },
          }}
          {...other}
        />
      )}
    />
  );
}