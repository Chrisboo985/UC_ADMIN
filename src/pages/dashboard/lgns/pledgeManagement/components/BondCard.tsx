import React, { useEffect, useCallback } from 'react';
import { debounce, round } from 'lodash-es';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  getRebaseRateAPI,
  getDistributeInfoAPI,
  getPreviewRebaseRateAPI,
  getEnableAlgorithmRebaseAPI,
  getCurrentRebaseRateAPI,
  setAlgorithmRebaseRateAPI,
  setDistributeInfoAPI,
  setEnableAlgorithmRebaseAPI,
  setRebaseRateAPI,
} from 'src/api/lgns';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { Switch } from './Switch';
import { Input, NumberInput } from './Input';
import { Button } from './Button';

// =============== Types ===============
interface BondCardProps {
  title: string;
  contractAddress: string;
}

export const BondCard = ({ title, contractAddress }: BondCardProps) => {
  // =============== States ===============
  // 基础状态
  const [rebaseRate, setRebaseRate] = React.useState('0.00');
  const [currentRebaseRate, setCurrentRebaseRate] = React.useState('0');
  const [targetDistributeInfo, setTargetDistributeInfo] = React.useState('0');
  const [estimatedRebaseRate, setEstimatedRebaseRate] = React.useState('0.00');
  const [distributeINFO, setDistributeINFO] = React.useState('0');

  // 控制状态
  const [algorithmControl, setAlgorithmControl] = React.useState(false);
  const [switchLoading, setSwitchLoading] = React.useState(false);

  // =============== API Calls ===============
  const fetchCurrentRebaseRate = useCallback(async () => {
    const response = await getCurrentRebaseRateAPI();
    setCurrentRebaseRate(response.data.value as string);
  }, []);

  const fetchDistributeInfo = useCallback(async () => {
    const response = await getDistributeInfoAPI();
    setDistributeINFO(response.data.value as string);
  }, []);

  const fetchRebaseRate = useCallback(async () => {
    const response = await getRebaseRateAPI();
    setRebaseRate(response.data.value as string);
  }, []);

  const fetchEnableAlgorithm = useCallback(async () => {
    const response = await getEnableAlgorithmRebaseAPI();
    setAlgorithmControl(!!response.data.value);
  }, []);

  // =============== Event Handlers ===============
  // 预览Rebase利率
  const handlePreviewRebaseRate = async () => {
    try {
      const response = await getPreviewRebaseRateAPI({
        distribute_info: Number(targetDistributeInfo),
      });
      setEstimatedRebaseRate(response.data.value as string);
    } catch (error) {
      console.error('预览失败:', error);
    }
  };

  // 设置分发信息
  const handleSetDistributeInfo = async () => {
    try {
      await setDistributeInfoAPI({ info: Number(distributeINFO) });
      if (algorithmControl) {
        fetchCurrentRebaseRate();
      } else {
        fetchRebaseRate();
      }
    } catch (error) {
      console.error('设置分发信息失败:', error);
    }
  };

  // 修改算法控制
  const handleSetAlgorithmControl = debounce(async (enabled: boolean) => {
    setSwitchLoading(true);
    try {
      await setEnableAlgorithmRebaseAPI({ enabled });
      setAlgorithmControl(enabled);

      if (enabled) {
        fetchCurrentRebaseRate();
      } else {
        fetchRebaseRate();
      }

      toast.success(enabled ? '开启算法控制成功!' : '关闭算法控制成功!');
    } catch (error) {
      console.error('设置算法控制失败:', error);
      toast.error(enabled ? '开启算法控制失败' : '关闭算法控制失败');
    } finally {
      setSwitchLoading(false);
    }
  }, 500);

  // 设置Rebase利率
  const handleSetRebaseRate = async () => {
    if (rebaseRate === '') {
      toast.error('请输入Rebase利率');
      return;
    }

    const rateNumber = Number(rebaseRate);

    if (Number.isNaN(rateNumber)) {
      toast.error('请输入有效的数字');
      return;
    }

    if (rateNumber < 0 || rateNumber > 1) {
      toast.error('Rebase利率必须在0到1之间');
      return;
    }

    const decimalPlaces = rebaseRate.toString().split('.')[1]?.length || 0;
    if (decimalPlaces > 18) {
      toast.error('最多支持18位小数');
      return;
    }

    try {
      await setRebaseRateAPI({ rate: rateNumber });
      fetchRebaseRate();
      toast.success('设置Rebase利率成功');
    } catch (error) {
      console.error('设置Rebase利率失败:', error);
      toast.error('设置Rebase利率失败');
    }
  };

  // =============== Effects ===============
  // 初始化数据
  useEffect(() => {
    fetchEnableAlgorithm();
    fetchCurrentRebaseRate();
    fetchRebaseRate();
    fetchDistributeInfo();
  }, [fetchEnableAlgorithm, fetchRebaseRate, fetchCurrentRebaseRate, fetchDistributeInfo]);

  // =============== Render ===============
  return (
    <div className="w-full bg-white rounded-2xl mb-4">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">合约地址: {contractAddress}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="text-sm">
            Distribute INFO：<span className="font-bold">{distributeINFO}</span>
          </div>
          <div className="text-sm">
            {/*   todo: 后端返回数据需要不乘100 */}
            当前Rebase利率：
            <span className="font-bold">{round(Number(currentRebaseRate) * 100, 2)}%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LoadingButton
            variant="text"
            loading={switchLoading}
            loadingPosition="end"
            // startIcon={<Iconify icon="ic:round-access-alarm" />}
            loadingIndicator={<div className="text-sm">Loading...</div>}
            onClick={() => handleSetAlgorithmControl(!algorithmControl)}
            sx={{ fontSize: '12px' }}
          >
            <Switch
              checked={algorithmControl}
              onChange={() => handleSetAlgorithmControl(!algorithmControl)}
            />
            <div className="text-sm " style={{ marginLeft: '8px', minWidth: '80px' }}>
              {!switchLoading && (!algorithmControl ? '当前关闭算法控制' : '当前开启算法控制')}
            </div>
          </LoadingButton>
        </div>

        {algorithmControl && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <NumberInput
                    type="number"
                    label="Distribute INFO"
                    min={0}
                    max={100000000}
                    step={0.001}
                    value={Number(distributeINFO)}
                    onChange={(value) => setDistributeINFO(value.toString())}
                  />
                </div>

                <Button onClick={handleSetDistributeInfo}>设置</Button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex-1">
                  <Input
                    label="Preview Distribute INFO"
                    value={targetDistributeInfo}
                    onChange={(value) => setTargetDistributeInfo(value.toString())}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm whitespace-nowrap">
                    预估Rebase利率:{' '}
                    <span className="font-bold">
                      {round(Number(estimatedRebaseRate) * 100, 2)}%
                    </span>
                  </div>
                </div>
                <Button onClick={handlePreviewRebaseRate}>预览</Button>
              </div>
            </div>
          </div>
        )}

        {!algorithmControl && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-8">
              <div className="flex-1">
                <NumberInput
                  type="number"
                  label="当前Rebase利率"
                  min={0}
                  max={1}
                  step={0.000000000000000001}
                  decimalPlaces={18}
                  value={Number(rebaseRate)}
                  onChange={(value) => setRebaseRate(value.toString())}
                />
              </div>
              <Button onClick={handleSetRebaseRate}>设置</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
