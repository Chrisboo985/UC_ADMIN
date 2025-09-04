import React from 'react';

interface InputProps {
  label: string;
  value: string;
  type?: string;
  onChange: (value: string) => void;
  [key: string]: any; // 允许传入任意其他属性
}

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  decimalPlaces?: number; // 新增：指定允许的小数位数
  [key: string]: any;
}

// 允许传入任意其他属性
export const Input = ({ label, value, type = 'text', onChange, ...rest }: InputProps) => (
  <div className="relative">
    <input
      id={`input-${label}`}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      placeholder=" "
      {...rest}
    />
    <label
      htmlFor={`input-${label}`}
      className="absolute -top-2 left-2 px-1 text-xs text-gray-500 bg-white"
    >
      {label}
    </label>
  </div>
);

// 新增的 NumberInput 组件
export const NumberInput = ({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.001,
  decimalPlaces = 3, // 默认允许3位小数
  ...rest
}: NumberInputProps) => {
  const [error, setError] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setError(''); // 清除错误提示

    // 允许空值和单个负号的输入
    if (inputValue === '' || inputValue === '-') {
      onChange(0);
      return;
    }

    // 检查小数位数
    const [integerPart, decimalPart] = inputValue.split('.');
    if (decimalPart && decimalPart.length > decimalPlaces) {
      return; // 如果小数位数超过限制，直接返回，不更新值
    }

    const newValue = parseFloat(inputValue);

    // 使用 Number.isNaN 替代 isNaN
    if (Number.isNaN(newValue)) {
      setError('请输入有效的数字');
      return;
    }

    onChange(newValue);
  };

  // 在失焦时进行范围校验
  const handleBlur = () => {
    if (value < min || value > max) {
      setError(`数值必须在 ${min} 到 ${max} 之间`);
      const clampedValue = Math.min(Math.max(value, min), max);
      onChange(clampedValue);
    }
  };

  return (
    <div className="relative">
      <input
        id={`input-${label}`}
        type="number"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
          ${error ? 'border-red-500' : 'border-gray-300'}`}
        placeholder=" "
        {...rest}
      />
      <label
        htmlFor={`input-${label}`}
        className={`absolute -top-2 left-2 px-1 text-xs bg-white 
          ${error ? 'text-red-500' : 'text-gray-500'}`}
      >
        {label}
      </label>
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};
