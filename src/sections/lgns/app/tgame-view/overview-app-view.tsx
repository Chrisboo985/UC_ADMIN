// tgame 概览
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
  getTgameAirDropStatisticsAPI,
  getTgameBondStakeAPI,
  getTgameCommunityBonusAPI,
  getTgameTeamBonusAPI
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

  // 修改状态定义
  const [apiData, setApiData] = useState<{
    tgameAirDropStatistics: any; // 或使用具体的类型 ResponsesMemberStatisticsResponse
    tgameBondStake: any;
    tgameCommunityBonus:any;
    tgameTeamBonus:any;
  }>({
    tgameAirDropStatistics: null,
    tgameBondStake: null,
    tgameCommunityBonus: null,
    tgameTeamBonus: null,
  });

  // 修改查询函数
  const handleQuery = async () => {
    try {
      setLgnsLoading(true); // 开始加载时设置为 true

      const [
        tgameAirDropStatistics,
        tgameBondStake,
        tgameCommunityBonus,
        tgameTeamBonus
      ] = await Promise.all([
        getTgameAirDropStatisticsAPI(),
        getTgameBondStakeAPI(),
        getTgameCommunityBonusAPI(),
        getTgameTeamBonusAPI()
      ]);

      setApiData({
        tgameAirDropStatistics,
        tgameBondStake,
        tgameCommunityBonus,
        tgameTeamBonus
      });
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLgnsLoading(false); // 无论成功失败都设置为 false
    }
  };

  useEffect(() => {
    handleQuery();
  }, []);

  // 债券列表
 

  // 更新 widgetData 结构
  const widgetData = {
    // tgame 质押数据
    TGAMEPledgeData: [
      {
        title: '今日债券TGAME 质押',
        total: apiData?.tgameBondStake?.data?.today_bond_stake_amount || '0',
        unit: '个',
        color: 'primary',
      },
      {
        title: '总TGAME 债券质押',
        total: apiData?.tgameBondStake?.data?.bond_stake_amount || '0',
        unit: '个',
        color: 'secondary',
      },
    ],
    // tgame 直推奖励
    TGAMEDirectPushRewards: [
      {
        title: '今日层级奖励（TGAME）',
        total: apiData?.tgameTeamBonus?.data?.today_bonus || '0',
        unit: '',
        color: 'primary',
      },
      {
        title: '本周层级奖励（TGAME）',
        total: apiData?.tgameTeamBonus?.data?.week_bonus || '0',
        unit: '',
        color: 'secondary',
      },
      {
        title: '总层级奖励（TGAME）',
        total: apiData?.tgameTeamBonus?.data?.total_bonus || '0',
        unit: '',
        color: 'success',
      },
    ],
    // tgame 社区奖励
    TGAMECommunityRewards: [
      {
        title: '今日社区奖励（TGAME）',
        total: apiData?.tgameCommunityBonus?.data?.today_bonus || '0',
        unit: '',
        color: 'primary',
      },
      {
        title: '本周社区奖励（TGAME）',
        total: apiData?.tgameCommunityBonus?.data?.week_bonus || '0',
        unit: '',
        color: 'secondary',
      },
      {
        title: '总社区奖励（TGAME）',
        total: apiData?.tgameCommunityBonus?.data?.total_bonus || '0',
        unit: '',
        color: 'success',
      },
    ],
    // NFT空投
    NFTAirdrops: [
      {
        title: '今日TCASH空投',
        total: apiData?.tgameAirDropStatistics?.data?.today_tcash || '0',
        unit: '',
        color: 'primary',
      },
      {
        title: '今日宝石空投',
        total: apiData?.tgameAirDropStatistics?.data?.today_key || '0',
        unit: '',
        color: 'secondary',
      },
      {
        title: '总TCASH空投',
        total: apiData?.tgameAirDropStatistics?.data?.total_tcash || '0',
        unit: '',
        color: 'success',
      },
      {
        title: '总宝石空投',
        total: apiData?.tgameAirDropStatistics?.data?.total_key || '0',
        unit: '',
        color: 'info',
      },
    ],


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

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="概览"
        links={[{ name: '控制台', href: paths.dashboard.root }, { name: '概览' }]}
        sx={{ mb: { xs: 3, md: 3 } }}
      />
      {/* 今日会员 、 活跃会员、总会员 */}
      {Object.entries(widgetData).map(([category, widgets], _wIndex) => {
        // 添加类目名称映射
        const categoryNameMap: Record<string, string> = {
          TGAMEPledgeData: 'TGAME质押数据',
          TGAMEDirectPushRewards: 'TGAME直推奖励',
          TGAMECommunityRewards: 'TGAME社区奖励',
          NFTAirdrops: 'NFT空投',
 
        };

        console.log('widgets', widgets);

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
