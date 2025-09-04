import React from 'react';

import { round } from 'lodash-es';
import { BondData } from 'src/api/lgns';
import { Switch } from './Switch';
import { Input, NumberInput } from './Input';
import { Button } from './Button';

export const BondCard = ({
  id,
  contract_address,
  new_contract_address,
  name,
  type,
  purchased_amount,
  release_cycle,
  control_variable,
  enable_algorithm,
  current_discount,
  total_supply,
  last_purchase_at,
  price,
  status,
  created_at,
  updated_at,
  discount,
  roi,
  type_string,
  business_type,
  created_at_string,
  updated_at_string,
  onStatusChange,
  onPriceChange,
  onDiscountChange,
  onControlVariableChange,
  onEnableAlgorithmChange,
}: BondData & {
  onStatusChange: (status: boolean) => void;
  onPriceChange: (price: string) => void;
  onDiscountChange: (discount: string) => void;
  onControlVariableChange: (controlVariable: string) => void;
  onEnableAlgorithmChange: (enable: boolean) => void;
}) => {
  // const [algorithmControl, setAlgorithmControl] = React.useState(enable_algorithm);
  const [algorithmControl, setAlgorithmControl] = React.useState(false);
  const [targetPrice, setTargetPrice] = React.useState(discount);
  const [controlBCV, setControlBCV] = React.useState(control_variable);
  // 当前折扣率
  const [currentDiscount, setCurrentDiscount] = React.useState(current_discount);
  // 预估目标价位
  const [estimatedPrice, setEstimatedPrice] = React.useState('0.00');

  // const [statusBoolean, setStatusBoolean] = React.useState(false);
  const [statusBoolean, setStatusBoolean] = React.useState(status === 'enable');

  const [algorithmControlBoolean, setAlgorithmControlBoolean] = React.useState(false);

  React.useEffect(() => {
    setTargetPrice(discount);
  }, [discount]);

  React.useEffect(() => {
    setControlBCV(control_variable);
  }, [control_variable]);

  React.useEffect(() => {
    setStatusBoolean(status === 'enable');
    // setStatusBoolean(false);
  }, [status]);

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg mb-4 lg:mb-8">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          {/* 超出的内容用省略号替代 支持点击复制 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <h2 className="text-lg font-semibold text-gray-900">{name}</h2>

            {/* 如果内容过长，用省略号替代 */}
            <p
              className="text-sm text-gray-500 mt-1 truncate"
              title={`合约地址: ${contract_address}`}
            >
              合约地址: {contract_address}
            </p>
            {/* 如果内容过长，用省略号替代 */}
            <p
              className="text-sm text-gray-500 mt-1 truncate"
              title={`合约地址: ${new_contract_address}`}
            >
              新合约地址: {new_contract_address}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {statusBoolean && <span className="text-sm">公开</span>}
            <Switch
              checked={statusBoolean}
              onChange={() => {
                onStatusChange(!statusBoolean);
              }}
            />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* <div className="text-sm">
            当前BCV: <span className="font-bold">{control_variable}</span>
          </div> */}
          <div className="text-sm">
            当前价格: <span className="font-bold">{round(Number(price), 4)}U</span>
          </div>
          <div className="text-sm">
            当前折扣率:{' '}
            <span className="font-bold">{round(Number(currentDiscount) * 100, 2)}%</span>
          </div>

          <div className="text-sm">
            债券类型: <span className="font-bold">{type === 1 ? '活期债券' : '长期债券'}</span>
          </div>
          <div className="text-sm">
            业务类型:{' '}
            <span className="font-bold">{business_type === 1 ? '国库' : 'LP'}</span>
          </div>
          <div className="text-sm">
            释放周期: <span className="font-bold">{release_cycle} 天</span>
          </div>
        </div>

        {algorithmControl && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <NumberInput
                    label="控制BCV"
                    type="number"
                    min={0}
                    max={10000000000000000000}
                    step={0.000000000000000001}
                    decimalPlaces={18}
                    value={Number(controlBCV)}
                    onChange={(value) => setControlBCV(value.toString())}
                  />
                </div>
                <div className="text-sm whitespace-nowrap">
                  预计价格：<span className="font-bold">{controlBCV}</span>
                </div>
                <Button onClick={() => onControlVariableChange(controlBCV)}>设置</Button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <Input label="目标价位" value={estimatedPrice} onChange={setEstimatedPrice} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm whitespace-nowrap">
                    当前BCV: <span className="font-bold">{control_variable}</span>
                  </div>
                  <div className="text-sm whitespace-nowrap">
                    当前价格: <span className="font-bold">{price}U</span>
                  </div>
                </div>
                <Button>预览</Button>
              </div>
            </div>
          </div>
        )}

        {!algorithmControl && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="flex-1">
                <NumberInput
                  label="目标折扣率"
                  type="number"
                  min={0}
                  max={10000000000000000000}
                  step={0.000000000000000001}
                  decimalPlaces={18}
                  value={Number(targetPrice)}
                  onChange={(value) => setTargetPrice(value.toString())}
                />
              </div>
              <Button onClick={() => onDiscountChange(targetPrice)}>设置</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
