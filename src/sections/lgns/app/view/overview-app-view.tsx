import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import { round } from 'lodash-es';
import Stack from '@mui/material/Stack';
import FormControl from '@mui/material/FormControl';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  getAdminOutlineAllAPI,
} from 'src/api/overview'; // 导入 API 函数

import { DashboardContent } from 'src/layouts/dashboard';
import { SeoIllustration } from 'src/assets/illustrations';
import { _appAuthors, _appRelated, _appFeatured, _appInvoices, _appInstalled } from 'src/_mock';

import { svgColorClasses } from 'src/components/svg-color';

import { useMockedUser } from 'src/auth/hooks';
import { paths } from 'src/routes/paths';

import { AppWidget } from '../app-widget';
import { AppWelcome } from '../app-welcome';
import { AppFeatured } from '../app-featured';
import { AppNewInvoice } from '../app-new-invoice';
import { AppTopAuthors } from '../app-top-authors';
import { AppTopRelated } from '../app-top-related';
import { AppAreaInstalled } from '../app-area-installed';
import { AppWidgetSummary } from '../app-widget-summary';
import { AppCurrentDownload } from '../app-current-download';
import { AppTopInstalledCountries } from '../app-top-installed-countries';

// ----------------------------------------------------------------------

export function OverviewAppView() {
  const { user } = useMockedUser();

  const theme = useTheme();

  const [lgnsLoading, setLgnsLoading] = useState<boolean>(true);

  // 默认数据
  const defaultData = [
    { title: '累计总LP债券购买（DAI+USDT）', total: '0 LGNS', subTotal: '0', color: 'primary' },
    { title: '总LP债券购买(DAI)', total: '0 LGNS', subTotal: '0', color: 'secondary' },
    { title: '总LP债券购买(USDT)', total: '0 LGNS', subTotal: '0', color: 'info' },
    { title: '总ETH债券购买', total: '0 LGNS', subTotal: '0', color: 'warning' },
    { title: '今日总LP债券购买（DAI+USDT）', total: '0 LGNS', subTotal: '0', color: 'error' },
    { title: '今日LP债券购买(DAI)', total: '0 LGNS', subTotal: '0', color: 'success' },
    { title: '今日LP债券购买(USDT)', total: '0 LGNS', subTotal: '0', color: 'primary' },
    { title: '总DAI债券购买', total: '0 LGNS', subTotal: '0', color: 'secondary' },
    { title: '总USDT债券购买', total: '0 LGNS', subTotal: '0', color: 'info' },
    { title: '今日DAI债券购买', total: '0 LGNS', subTotal: '0', color: 'warning' },
    { title: '今日USDT债券购买', total: '0 LGNS', subTotal: '0', color: 'error' },
    { title: 'LGNS总质押', total: '0', subTotal: '', color: 'success' },
    { title: 'LGNS今日质押', total: '0', subTotal: '', color: 'primary' },
    { title: 'LGNS总解押', total: '0', subTotal: '', color: 'secondary' },
    { title: 'LGNS今日解押', total: '0', subTotal: '', color: 'info' },
    { title: '总产生5%直推奖励(LPBond DAI)', total: '0 LGNS', subTotal: '', color: 'warning' },
    { title: '总产生5%直推奖励(LPBond USDT)', total: '0 LGNS', subTotal: '', color: 'error' },
    { title: '总产生5%直推奖励(DAI国库)', total: '0 LGNS', subTotal: '', color: 'success' },
    { title: '今日产生5%直推奖励(LPBond DAI)', total: '0 LGNS', subTotal: '', color: 'primary' },
    {
      title: '今日产生5%直推奖励(LPBond USDT)',
      total: '0 LGNS',
      subTotal: '',
      color: 'secondary',
    },
    { title: '今日产生5%直推奖励(DAI国库)', total: '0 LGNS', subTotal: '', color: 'info' },
    { title: '总产生社区DAO奖励', total: '0', subTotal: '123123', color: 'warning' },
    { title: '今日社区DAO奖励', total: '0', subTotal: '', color: 'error' },
    { title: '总蛛网奖励', total: '0', subTotal: '', color: 'success' },
    { title: '今日蛛网奖励', total: '0', subTotal: '', color: 'primary' },
    { title: '总推奖励领取', total: '0', subTotal: '', color: 'secondary' },
    { title: '总蛛网奖励领取', total: '0', subTotal: '', color: 'info' },
    { title: '总DAO奖励领取', total: '0', subTotal: '', color: 'warning' },
    { title: '当日直推奖励领取', total: '0', subTotal: '', color: 'error' },
    { title: '当日蛛网奖励领取', total: '0', subTotal: '', color: 'success' },
    { title: '当日DAO奖励领取', total: '0', subTotal: '', color: 'primary' },
  ];

  // 修改状态定义 - 使用新的接口数据结构
  const [apiData, setApiData] = useState<any>(null);
  // 修改查询函数 - 使用新的统一接口
  const handleQuery = async () => {
    try {
      setLgnsLoading(true); // 开始加载时设置为 true

      const response = await getAdminOutlineAllAPI();
      setApiData(response.data || null);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLgnsLoading(false); // 无论成功失败都设置为 false
    }
  };

  useEffect(() => {
    handleQuery();
  }, []);

  // 债券列表 - 暂时为空数组，因为新接口结构中没有债券详细信息
  const bondList: any[] = [];

  /// 更新 widgetData 结构，按照api.ts中的接口顺序排列
  const widgetData = {
    // 7. 用户统计数据
    member_data: [
      {
        title: '今日新增会员',
        total: apiData?.member_data?.today_new_members || '0',
        unit: '个',
        color: 'primary',
      },
      {
        title: '本周新增会员',
        total: apiData?.member_data?.week_new_members || '0',
        unit: '个',
        color: 'secondary',
      },
      {
        title: '本月新增会员',
        total: apiData?.member_data?.month_new_members || '0',
        unit: '个',
        color: 'success',
      },
      {
        title: '总会员',
        total: apiData?.member_data?.total_members || '0',
        unit: '个',
        color: 'error',
      },
    ],
    order_data:[
      {
        title: '今日新增认购节点',
        total: apiData?.order_data?.today_new_order_amount || '0',
        unit: 'USD1',
        color: 'primary',
      },
      {
        title: '本周新增认购节点',
        total: apiData?.order_data?.week_new_order_amount || '0',
        unit: 'USD1',
        color: 'secondary',
      },
      {
        title: '本月新增认购节点',
        total: apiData?.order_data?.month_new_order_amount || '0',
        unit: 'USD1',
        color: 'secondary',
      },
      {
        title: '总认购节点',
        total: apiData?.order_data?.total_order_amount || '0',
        unit: 'USD1',
        color: 'secondary',
      },
    ],

    // memberData: [
    //   {
    //     title: '今日新增会员',
    //     total: apiData?.admin_member_res?.today_new_members || '0',
    //     unit: '个',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周新增会员',
    //     total: apiData?.admin_member_res?.week_new_members || '0',
    //     unit: '个',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月新增会员',
    //     total: apiData?.admin_member_res?.month_new_members || '0',
    //     unit: '个',
    //     color: 'success',
    //   },
    //   {
    //     title: '总会员',
    //     total: apiData?.admin_member_res?.total_members || '0',
    //     unit: '个',
    //     color: 'error',
    //   },
    // ],
    //     // 8. 矿机统计数据
    // powerLogData: [
    //   {
    //     title: '今日矿机购买',
    //     total: apiData?.admin_power_log_res?.today_purchase || '0',
    //     unit: '',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周矿机购买',
    //     total: apiData?.admin_power_log_res?.week_purchase || '0',
    //     unit: '',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月矿机购买',
    //     total: apiData?.admin_power_log_res?.month_purchase || '0',
    //     unit: '',
    //     color: 'success',
    //   },
    //   {
    //     title: '矿机总计',
    //     total: apiData?.admin_power_log_res?.total_purchase || '0',
    //     unit: '',
    //     color: 'error',
    //   },
    // ],
    // 1. 代数奖励APD数据
    algebraRewardApdData: [
      {
        title: '今日充值总额',
        total: apiData?.deposit_data?.today_forward_amount || '0',
        unit: '',
        color: 'primary',
      },
      {
        title: '本周充值总额',
        total: apiData?.deposit_data?.week_forward_amount || '0',
        unit: '',
        color: 'secondary',
      },
      {
        title: '本月充值总额',
        total: apiData?.deposit_data?.month_forward_amount || '0',
        unit: '',
        color: 'success',
      },
      {
        title: '总充值总额',
        total: apiData?.deposit_data?.total_forward_amount || '0',
        unit: '',
        color: 'success',
      },
    ],

    // // 2. 代数奖励CP数据
    // algebraRewardCpData: [
    //   {
    //     title: '今日代数奖励CP',
    //     total: apiData?.admin_algebra_reward_cp_res?.today_profit || '0',
    //     unit: 'CP',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周代数奖励CP',
    //     total: apiData?.admin_algebra_reward_cp_res?.week_profit || '0',
    //     unit: 'CP',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月代数奖励CP',
    //     total: apiData?.admin_algebra_reward_cp_res?.month_profit || '0',
    //     unit: 'CP',
    //     color: 'success',
    //   },
    // ],

    // // 3. 极差奖励APD数据
    // diffRewardApdData: [
    //   {
    //     title: '今日极差奖励APD',
    //     total: apiData?.admin_diff_reward_apd_res?.today_profit || '0',
    //     unit: 'APD',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周极差奖励APD',
    //     total: apiData?.admin_diff_reward_apd_res?.week_profit || '0',
    //     unit: 'APD',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月极差奖励APD',
    //     total: apiData?.admin_diff_reward_apd_res?.month_profit || '0',
    //     unit: 'APD',
    //     color: 'success',
    //   },
    // ],

    // // 4. 极差奖励CP数据
    // diffRewardCpData: [
    //   {
    //     title: '今日极差奖励CP',
    //     total: apiData?.admin_diff_reward_cp_res?.today_profit || '0',
    //     unit: 'CP',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周极差奖励CP',
    //     total: apiData?.admin_diff_reward_cp_res?.week_profit || '0',
    //     unit: 'CP',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月极差奖励CP',
    //     total: apiData?.admin_diff_reward_cp_res?.month_profit || '0',
    //     unit: 'CP',
    //     color: 'success',
    //   },
    // ],

    // // 5. 升级奖励APD数据
    // levelUpApdData: [
    //   {
    //     title: '今日升级奖励APD',
    //     total: apiData?.admin_level_up_apd_res?.today_profit || '0',
    //     unit: 'APD',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周升级奖励APD',
    //     total: apiData?.admin_level_up_apd_res?.week_profit || '0',
    //     unit: 'APD',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月升级奖励APD',
    //     total: apiData?.admin_level_up_apd_res?.month_profit || '0',
    //     unit: 'APD',
    //     color: 'success',
    //   },
    // ],

    // // 6. 升级奖励CP数据
    // levelUpCpData: [
    //   {
    //     title: '今日升级奖励CP',
    //     total: apiData?.admin_level_up_cp_res?.today_profit || '0',
    //     unit: 'CP',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周升级奖励CP',
    //     total: apiData?.admin_level_up_cp_res?.week_profit || '0',
    //     unit: 'CP',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月升级奖励CP',
    //     total: apiData?.admin_level_up_cp_res?.month_profit || '0',
    //     unit: 'CP',
    //     color: 'success',
    //   },
    // ],

    // // 9. 矿机类型统计数据
    // powerTypeData: [
    //   {
    //     title: '今日普卡购买',
    //     total: apiData?.admin_power_type_normal_res?.today_power_type_purchase || '0',
    //     unit: '',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周普卡购买',
    //     total: apiData?.admin_power_type_normal_res?.week_power_type_purchase || '0',
    //     unit: '',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月普卡购买',
    //     total: apiData?.admin_power_type_normal_res?.month_power_type_purchase || '0',
    //     unit: '',
    //     color: 'success',
    //   },
    // ],
    // // 金卡统计数据
    // goldCardData: [
    //   {
    //     title: '今日金卡矿机购买',
    //     total: apiData?.admin_power_type_gold_res?.today_power_type_purchase || '0',
    //     unit: '',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周金卡矿机购买',
    //     total: apiData?.admin_power_type_gold_res?.week_power_type_purchase || '0',
    //     unit: '',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月金卡矿机购买',
    //     total: apiData?.admin_power_type_gold_res?.month_power_type_purchase || '0',
    //     unit: '',
    //     color: 'success',
    //   },
    // ],


    // // 铂金卡统计数据
    // diamondCardData: [
    //   {
    //     title: '今日铂金卡矿机购买',
    //     total: apiData?.admin_power_type_diamond_res?.today_power_type_purchase || '0',
    //     unit: '',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周铂金卡矿机购买',
    //     total: apiData?.admin_power_type_diamond_res?.week_power_type_purchase || '0',
    //     unit: '',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月铂金卡矿机购买',
    //     total: apiData?.admin_power_type_diamond_res?.month_power_type_purchase || '0',
    //     unit: '',
    //     color: 'success',
    //   },
    // ],

    // // 黑卡统计数据
    // blackCardData: [
    //   {
    //     title: '今日黑卡矿机购买',
    //     total: apiData?.admin_power_type_black_res?.today_power_type_purchase || '0',
    //     unit: '',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周黑卡矿机购买',
    //     total: apiData?.admin_power_type_black_res?.week_power_type_purchase || '0',
    //     unit: '',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月黑卡矿机购买',
    //     total: apiData?.admin_power_type_black_res?.month_power_type_purchase || '0',
    //     unit: '',
    //     color: 'success',
    //   },
    // ],


    // // 10. 挖矿奖励APD数据
    // rebaseApdData: [
    //   {
    //     title: '今日挖矿奖励APD',
    //     total: apiData?.admin_rebase_apd_res?.today_profit || '0',
    //     unit: 'APD',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周挖矿奖励APD',
    //     total: apiData?.admin_rebase_apd_res?.week_profit || '0',
    //     unit: 'APD',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月挖矿奖励APD',
    //     total: apiData?.admin_rebase_apd_res?.month_profit || '0',
    //     unit: 'APD',
    //     color: 'success',
    //   },
    // ],

    // // 11. 挖矿奖励CP数据
    // rebaseCpData: [
    //   {
    //     title: '今日挖矿奖励CP',
    //     total: apiData?.admin_rebase_cp_res?.today_profit || '0',
    //     unit: 'CP',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周挖矿奖励CP',
    //     total: apiData?.admin_rebase_cp_res?.week_profit || '0',
    //     unit: 'CP',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月挖矿奖励CP',
    //     total: apiData?.admin_rebase_cp_res?.month_profit || '0',
    //     unit: 'CP',
    //     color: 'success',
    //   },
    // ],

    // // 12. 充值TP数据
    // topUpTpData: [
    //   {
    //     title: '今日USDA充值TP返利',
    //     total: apiData?.admin_top_up_tp_res?.today_profit || '0',
    //     unit: 'TP',
    //     color: 'primary',
    //   },
    //   {
    //     title: '本周USDA充值TP返利',
    //     total: apiData?.admin_top_up_tp_res?.week_profit || '0',
    //     unit: 'TP',
    //     color: 'secondary',
    //   },
    //   {
    //     title: '本月USDA充值TP返利',
    //     total: apiData?.admin_top_up_tp_res?.month_profit || '0',
    //     unit: 'TP',
    //     color: 'success',
    //   },
    // ],
  };

  if (lgnsLoading) {
    return (
      <DashboardContent maxWidth="xl">
        <Grid container spacing={3}>
          {defaultData.map((_, index) => (
            <Grid key={index} xs={12} md={4}>
              <Skeleton variant="rectangular" width="100%" height={118} />
            </Grid>
          ))}
        </Grid>
      </DashboardContent>
    );
  }
  // 添加类目名称映射（按照api.ts接口顺序）
  const categoryNameMap: Record<string, string> = {
    member_data: '会员数据',
    order_data: '认购节点数据',
    algebraRewardApdData: '充值数据',
    // algebraRewardCpData: '代数奖励CP数据',
    // diffRewardApdData: '极差奖励APD数据',
    // diffRewardCpData: '极差奖励CP数据',
    // levelUpApdData: '升级奖励APD数据',
    // levelUpCpData: '升级奖励CP数据',
    // memberData: '用户统计',
    // powerLogData: '矿机统计',
    // powerTypeData: '普卡类型统计',
    // blackCardData: '黑卡类型统计',
    // diamondCardData: '铂金卡类型统计',
    // goldCardData: '金卡类型统计',
    // rebaseApdData: '挖矿APD数据',
    // rebaseCpData: '挖矿CP数据',
    // topUpTpData: '充值TP数据',
  };
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="概览"
        links={[{ name: '数据' }, { name: '概览' }]}
        sx={{ mb: { xs: 3, md: 3 } }}
      />
      {/* 今日会员 、 活跃会员、总会员 */}
      {Object.entries(widgetData).map(([category, widgets], _wIndex) => {
        // console.log('widgets', widgets);

        return (
          <Box key={_wIndex}>
            <Box sx={{ typography: 'subtitle1', mb: 1, mt: 5 }}>
              {categoryNameMap[category] || category}
            </Box>

            <Grid container spacing={3}>
              {widgets.map((widget, index) => (
                <Grid xs={12} sm={6} md={4} key={index}>
                  <Box
                    sx={{
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppWidgetSummary
                      title={widget.title}
                      percent={0}
                      total={round(Number(widget.total), 4)}
                      unit={widget.unit}
                      chart={{
                        colors: [(theme.vars.palette as any)[widget.color].main],
                        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                        series: [
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                          Math.random() * 10,
                        ],
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </DashboardContent>
  );
}
