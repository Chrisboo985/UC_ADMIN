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
    ]

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
  };
  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="概览"
        links={[{ name: '控制台', href: paths.dashboard.root }, { name: '概览' }]}
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
