import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import FormGroup from '@mui/material/FormGroup';
import { useTheme } from '@mui/material/styles';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'src/components/snackbar';
import {
  getBondIndexAPI,
  setControlVariableAPI,
  setBondPriceAPI,
  setBondStatusAPI,
  setEnableAlgorithmAPI,
  setBondDiscountAPI,
  BondData,
  createBondPurchaseAPI,
  setBondContractUseAPI,
  getConfigByKeyAPI,
} from 'src/api/lgns';
// Use BondData instead of ModelsBondPurchase

import { BondForm, EventSchemaType } from './components/bond-form';
import { BondCard } from './components/BondCard';

import './index.css';

function ContractManagementView() {
  const theme = useTheme();

  const [bonds, setBonds] = useState<BondData[]>([]);

  const [openBondForm, setOpenBondForm] = useState(false);
  
  // 新旧债券切换状态 (1:新债券, 2:旧债券)
  const [bondContractType, setBondContractType] = useState<string>('2');
  const [loadingContractType, setLoadingContractType] = useState<boolean>(false);

  const handleCloseBondForm = useCallback(() => {
    setOpenBondForm(false);
    setCurrentUser({} as BondData);
  }, []);

  const [currentUser, setCurrentUser] = useState<BondData>({} as BondData);

  const handleClosePledgeForm = useCallback(() => {
    setOpenBondForm(false);
    setCurrentUser({} as BondData);
  }, []);

  const handleFormSubmit = async (formData: EventSchemaType) => {
    try {
      if (currentUser?.id) {
        // // 编辑模式
        // await updateBondPurchaseAPI({ coin: 'KSN', id: currentUser.id, ...formData });
        // toast.success('修改成功');
      } else {
        // 新增模式
        const bondData = {
          name: formData.name,
          contract_address: formData.contract_address,
          discount: parseFloat(formData.discount),
          release_cycle: parseInt(formData.release_cycle, 10),
          status: formData.status,
          type: parseInt(formData.type, 10),
          business_type: parseInt(formData.business_type, 10),
        };
        
        await createBondPurchaseAPI(bondData);
        toast.success('新增成功');
      }
      handleClosePledgeForm();
      fetchBondData();
    } catch (error) {
      console.error(error);
      toast.error('操作失败');
    }
  };

  // 获取债券列表数据
  const fetchBondData = async () => {
    try {
      const response = await getBondIndexAPI({
        page: 1,
        page_size: 100,
      });

      console.log('response获取债券列表', response);
      if (response.data) {
        const bondData = response.data;

        // 按照ID进行升序排序
        // bondData.sort((a, b) => a.id - b.id);
        setBonds(bondData.list);
      }
    } catch (error) {
      console.error('获取债券列表失败:', error);
      toast.error('获取债券列表失败!');
    }
  };

  const handleAddBond = () => {
    console.log('增加质押合约');
    setOpenBondForm(true);
  };
  const handleControlVariableChange = async (itemOne: BondData, controlVariable: string) => {
    try {
      await setControlVariableAPI({
        id: itemOne.id,
        control_variable: controlVariable,
      });

      toast.success('设置控制变量成功!');

      // 重新获取数据以更新列表
      fetchBondData();
    } catch (error) {
      console.error('设置债券控制变量失败:', error);
      toast.error('设置控制变量失败!');
    }
  };

  // 处理债券状态变更
  const handleStatusChange = async (itemOne: BondData, status: boolean) => {
    console.log('itemOne', itemOne);
    console.log('status', status);
    try {
      await setBondStatusAPI({
        id: itemOne.id,
        status: status ? 'enable' : 'disable',
      });
      toast.success(`${status ? '开启' : '关闭'}质押合约成功!`);
      // 重新获取数据以更新列表
      fetchBondData();
    } catch (error) {
      console.error('设置债券状态失败:', error);
      toast.error('设置债券状态失败!');
    }
  };

  // 开启算法控制
  const handleEnableAlgorithmChange = async (itemOne: BondData, enable: boolean) => {
    try {
      await setEnableAlgorithmAPI({
        id: itemOne.id,
        enable_algorithm: enable,
      });
      toast.success(`${enable ? '开启' : '关闭'}算法控制成功!`);
      // 重新获取数据以更新列表
      fetchBondData();
    } catch (error) {
      console.error('设置债券启用算法失败:', error);
      toast.error('设置债券启用算法失败!');
    }
  };

  // 处理债券价格变更
  const handlePriceChange = async (itemOne: BondData, price: string) => {
    try {
      await setBondPriceAPI({
        id: itemOne.id,
        price: Number(price),
      });
      toast.success('设置债券价格成功!');
      // 重新获取数据以更新列表
      fetchBondData();
    } catch (error) {
      console.error('设置债券价格失败:', error);
      toast.error('设置债券价格失败!');
    }
  };

  // 处理债券折扣率变更
  const handleDiscountChange = async (itemOne: BondData, discount: string) => {
    console.log('itemOne', itemOne);
    console.log('discount', discount);
    try {
      await setBondDiscountAPI({
        id: itemOne.id,
        discount: Number(discount),
      });
      toast.success('设置债券折扣率成功!');
      // 重新获取数据以更新列表
      fetchBondData();
    } catch (error) {
      console.error('设置债券折扣率失败:', error);
      toast.error('设置债券折扣率失败!');
    }
  };

  // 获取当前债券合约使用类型
  const fetchBondContractUseType = async () => {
    try {
      // 获取债券合约使用类型 (1:新债券, 2:旧债券)
      const response = await getConfigByKeyAPI('bond_contract_use');
      if (response.data) {
        const value = response.data.value;
        // 确保值是字符串类型
        setBondContractType(typeof value === 'string' ? value : String(value) || '2');
      }
    } catch (error) {
      console.error('获取债券合约使用类型失败:', error);
      toast.error('获取债券合约使用类型失败!');
    }
  };

  // 切换债券合约使用类型
  const handleBondContractTypeChange = async (type: string) => {
    try {
      setLoadingContractType(true);
      await setBondContractUseAPI(type);
      setBondContractType(type);
      toast.success(`切换至${type === '1' ? '新' : '旧'}债券合约成功!`);
    } catch (error) {
      console.error('切换债券合约类型失败:', error);
      toast.error('切换债券合约类型失败!');
    } finally {
      setLoadingContractType(false);
    }
  };
  
  // 组件加载时获取数据
  useEffect(() => {
    fetchBondData();
    fetchBondContractUseType();
  }, []);

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="质押合约管理"
          links={[
            { name: '控制台', href: paths.dashboard.root },
            { name: '合约操作台', href: paths.dashboard.lgns.rebaseRecord },
            { name: '质押合约管理' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Stack
          spacing={3}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          sx={{ p: { xs: 2, md: 2 }, pb: 0 }}
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: theme => theme.palette.background.neutral,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" sx={{ mr: 3, fontWeight: 'bold' }}>
              当前启用:
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Tooltip title={bondContractType === '1' ? '当前正在启用新债券' : '点击切换到新债券'} arrow>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex'
                  }}
                >
                  <Button
                    variant={bondContractType === '1' ? 'contained' : 'outlined'}
                    color={bondContractType === '1' ? 'success' : 'inherit'}
                    onClick={() => handleBondContractTypeChange('1')}
                    disabled={loadingContractType || bondContractType === '1'}
                    sx={{ 
                      px: 3,
                      py: 1.2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: bondContractType === '1' ? 8 : 0,
                      border: bondContractType === '1' ? '2px solid' : '1px solid',
                      borderColor: bondContractType === '1' ? 'success.main' : 'inherit',
                    }}
                  >
                    新债券
                  </Button>
                  {bondContractType === '1' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        boxShadow: 2
                      }}
                    >
                      ✓
                    </Box>
                  )}
                </Box>
              </Tooltip>
              
              <Tooltip title={bondContractType === '2' ? '当前正在启用旧债券' : '点击切换到旧债券'} arrow>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-flex'
                  }}
                >
                  <Button
                    variant={bondContractType === '2' ? 'contained' : 'outlined'}
                    color={bondContractType === '2' ? 'success' : 'inherit'}
                    onClick={() => handleBondContractTypeChange('2')}
                    disabled={loadingContractType || bondContractType === '2'}
                    sx={{ 
                      px: 3,
                      py: 1.2,
                      fontWeight: 'bold',
                      fontSize: '1rem',
                      boxShadow: bondContractType === '2' ? 8 : 0,
                      border: bondContractType === '2' ? '2px solid' : '1px solid',
                      borderColor: bondContractType === '2' ? 'success.main' : 'inherit',
                    }}
                  >
                    旧债券
                  </Button>
                  {bondContractType === '2' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        bgcolor: 'success.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid white',
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        boxShadow: 2
                      }}
                    >
                      ✓
                    </Box>
                  )}
                </Box>
              </Tooltip>
            </Box>
          </Paper>
          
          <FormControl component="fieldset" sx={{ flexShrink: 0, minWidth: { xs: 1, md: 200 } }}>
            <Button variant="contained" onClick={handleAddBond}>
              新增质押合约
            </Button>
          </FormControl>
        </Stack>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {bonds.map((bond, index) => (
            <BondCard
              key={index}
              {...bond}
              onStatusChange={(status) => handleStatusChange(bond, status)}
              onPriceChange={(price) => handlePriceChange(bond, price)}
              onDiscountChange={(discount) => handleDiscountChange(bond, discount)}
              onControlVariableChange={(controlVariable) =>
                handleControlVariableChange(bond, controlVariable)
              }
              onEnableAlgorithmChange={(enable) => handleEnableAlgorithmChange(bond, enable)}
            />
          ))}
        </div>

        <Dialog
          fullWidth
          maxWidth="xs"
          open={openBondForm}
          onClose={handleCloseBondForm}
          transitionDuration={{
            enter: theme.transitions.duration.shortest,
            exit: theme.transitions.duration.shortest - 80,
          }}
          PaperProps={{
            sx: {
              display: 'flex',
              overflow: 'hidden',
              flexDirection: 'column',
              '& form': {
                minHeight: 0,
                display: 'flex',
                flex: '1 1 auto',
                flexDirection: 'column',
              },
            },
          }}
        >
          <DialogTitle sx={{ minHeight: 76 }}>
            {currentUser.id ? '设置' : '新增'}质押合约
          </DialogTitle>
          <BondForm
            currentEvent={currentUser}
            onClose={handleClosePledgeForm}
            onSubmit={handleFormSubmit}
          />
        </Dialog>
      </DashboardContent>
    </>
  );
}

export default ContractManagementView;

/*
todo:
  1. 开启算法控制
  2. 预览目标价位 
  3. 排版样式处理

*/
