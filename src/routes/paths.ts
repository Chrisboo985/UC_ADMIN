import { paramCase } from 'src/utils/change-case';

import { _id, _postTitles } from 'src/_mock/assets';

// ----------------------------------------------------------------------

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
};

console.log(`${ROOTS.DASHBOARD}/log/node-subscription`)

// ----------------------------------------------------------------------

export const paths = {
  comingSoon: '/coming-soon',
  maintenance: '/maintenance',
  pricing: '/pricing',
  payment: '/payment',
  about: '/about-us',
  contact: '/contact-us',
  faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  components: '/components',
  docs: 'https://docs.minimals.cc',
  changelog: 'https://docs.minimals.cc/changelog',
  zoneStore: 'https://mui.com/store/items/zone-landing-page/',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  figmaUrl: 'https://www.figma.com/design/cAPz4pYPtQEXivqe11EcDE/%5BPreview%5D-Minimal-Web.v6.0.0',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id: string) => `/product/${id}`,
    demo: { details: `/product/${MOCK_ID}` },
  },
  post: {
    root: `/post`,
    details: (title: string) => `/post/${paramCase(title)}`,
    demo: { details: `/post/${paramCase(MOCK_TITLE)}` },
  },
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },

  admin: {
    root: `${ROOTS.ADMIN}`,
    lgns: {
      root: `${ROOTS.DASHBOARD}/lgns`,
      // overviewAnalyticsView: `${ROOTS.DASHBOARD}/lgns/OverviewAnalyticsView`,
      rebaseRecord: `${ROOTS.DASHBOARD}/lgns/rebaseRecord`,
      contractTask: `${ROOTS.DASHBOARD}/lgns/contractTask`,
      rebaseOperationQueue: `${ROOTS.DASHBOARD}/lgns/rebaseOperationQueue`,
      tGameRebaseOperationQueue: `${ROOTS.DASHBOARD}/lgns/tGameRebaseOperationQueue`,
      stakingRanking: `${ROOTS.DASHBOARD}/lgns/stakingRanking`,
      contractManagement: `${ROOTS.DASHBOARD}/lgns/contractManagement`,
      pledgeManagement: `${ROOTS.DASHBOARD}/lgns/pledgeManagement`,
      daoRecord: `${ROOTS.DASHBOARD}/lgns/daoRecord`,
      // treasuryLP: `${ROOTS.DASHBOARD}/lgns/treasuryLp`,
    },
  },

  // DASHBOARD
  dashboard: {
    root: `${ROOTS.DASHBOARD}`,
    tGame: `${ROOTS.DASHBOARD}/tGame`,
    mail: `${ROOTS.DASHBOARD}/mail`,
    chat: `${ROOTS.DASHBOARD}/chat`,
    blank: `${ROOTS.DASHBOARD}/blank`,
    kanban: `${ROOTS.DASHBOARD}/kanban`,
    calendar: `${ROOTS.DASHBOARD}/calendar`,
    fileManager: `${ROOTS.DASHBOARD}/file-manager`,
    permission: `${ROOTS.DASHBOARD}/permission`,


    gameAirPortRush: {
      root: `${ROOTS.DASHBOARD}/gameAirPortRush`,
      gameHistory: `${ROOTS.DASHBOARD}/gameAirPortRush/gameHistory`,
      gameRanking: `${ROOTS.DASHBOARD}/gameAirPortRush/gameRanking`,
    },
    communityGovernance: {
      root: `${ROOTS.DASHBOARD}/communityGovernance`,
      bondBuy: `${ROOTS.DASHBOARD}/communityGovernance/bondBuy`,
      unionData: `${ROOTS.DASHBOARD}/communityGovernance/unionData`,
      communityPerformanceSummary: `${ROOTS.DASHBOARD}/communityGovernance/communityPerformanceSummary`,
      announcementControl: `${ROOTS.DASHBOARD}/communityGovernance/announcementControl`,
      communityBondPurchaseDailyRecordList: `${ROOTS.DASHBOARD}/communityGovernance/communityBondPurchaseDailyRecordList`,
      communityStaking: `${ROOTS.DASHBOARD}/communityGovernance/communityStaking`,
    },
    general: {
      app: `${ROOTS.DASHBOARD}/app`,
      ecommerce: `${ROOTS.DASHBOARD}/ecommerce`,
      analytics: `${ROOTS.DASHBOARD}/analytics`,
      banking: `${ROOTS.DASHBOARD}/banking`,
      booking: `${ROOTS.DASHBOARD}/booking`,
      file: `${ROOTS.DASHBOARD}/file`,
      course: `${ROOTS.DASHBOARD}/course`,
    },
    lgns: {
      root: `${ROOTS.DASHBOARD}/lgns`,
      // overviewAnalyticsView: `${ROOTS.DASHBOARD}/lgns/OverviewAnalyticsView`,
      configManagement: `${ROOTS.DASHBOARD}/lgns/configManagement`,
      rebaseRecord: `${ROOTS.DASHBOARD}/lgns/rebaseRecord`,
      daoRecord: `${ROOTS.DASHBOARD}/lgns/daoRecord`,
      nftContractManagement: `${ROOTS.DASHBOARD}/lgns/nftContractManagement`,
      contractTask: `${ROOTS.DASHBOARD}/lgns/contractTask`,
      rebaseOperationQueue: `${ROOTS.DASHBOARD}/lgns/rebaseOperationQueue`,
      stakingRanking: `${ROOTS.DASHBOARD}/lgns/stakingRanking`,
      contractManagement: `${ROOTS.DASHBOARD}/lgns/contractManagement`,
      pledgeManagement: `${ROOTS.DASHBOARD}/lgns/pledgeManagement`,
      communitDividends: `${ROOTS.DASHBOARD}/lgns/communitDividends`,
      tierDividend: `${ROOTS.DASHBOARD}/lgns/tierDividend`,
      // treasuryLP: `${ROOTS.DASHBOARD}/lgns/treasuryLp`,
      nftAirdropFlow: `${ROOTS.DASHBOARD}/lgns/nftAirdropFlow`,
    },
    user: {
      root: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      communityRewardQuery: `${ROOTS.DASHBOARD}/user/communityRewardQuery`,
      communityRewardList: `${ROOTS.DASHBOARD}/user/communityRewardList`,
      cards: `${ROOTS.DASHBOARD}/user/cards`,
      organizationalChart: `${ROOTS.DASHBOARD}/user/organizationalChart`,
      parentList: `${ROOTS.DASHBOARD}/user/parent-list`,
      parentModifyLog: `${ROOTS.DASHBOARD}/user/parent-modify-log`,
      transferLog: `${ROOTS.DASHBOARD}/user/transfer-log`,
      performanceList: `${ROOTS.DASHBOARD}/user/performance-list`,
      performanceSwap: `${ROOTS.DASHBOARD}/user/performance-swap`,
      performanceBondPurchase: `${ROOTS.DASHBOARD}/user/performance-bond-purchase`,
      performanceBondPurchaseGather: `${ROOTS.DASHBOARD}/user/performance-bond-purchase-gather`,
      performanceBondWithSwap: `${ROOTS.DASHBOARD}/user/performance-bond-with-swap`,
      profile: `${ROOTS.DASHBOARD}/user/profile`,
      account: `${ROOTS.DASHBOARD}/user/account`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
      teamPerformanceInquiry: `${ROOTS.DASHBOARD}/user/teamPerformanceInquiry`,
      demo: {
        edit: `${ROOTS.DASHBOARD}/user/${MOCK_ID}/edit`,
      },
    },
    log: {
      root: `${ROOTS.DASHBOARD}/log/list`,
      nodeSubscription:  `${ROOTS.DASHBOARD}/log/node-subscription`
    },
    recharge: {
      root: `${ROOTS.DASHBOARD}/recharge/list`,
      rechargeList:  `${ROOTS.DASHBOARD}/recharge/recharge-list`
    },
    product: {
      root: `${ROOTS.DASHBOARD}/product`,
      new: `${ROOTS.DASHBOARD}/product/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/product/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/product/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/product/${MOCK_ID}/edit`,
      },
    },
    financialConsole: {
      root: `${ROOTS.DASHBOARD}/financialConsole`,
      pledgeRecords: `${ROOTS.DASHBOARD}/financialConsole/pledgeRecords`,
      bondPurchaseRecords: `${ROOTS.DASHBOARD}/financialConsole/bondPurchaseRecords`,
      bondBonusIndex: `${ROOTS.DASHBOARD}/financialConsole/bondBonusIndex`,
      bondSalesRecords: `${ROOTS.DASHBOARD}/financialConsole/bondSalesRecords`,
    },
    invoice: {
      root: `${ROOTS.DASHBOARD}/invoice`,
      new: `${ROOTS.DASHBOARD}/invoice/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/invoice/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/invoice/${MOCK_ID}/edit`,
      },
    },
    post: {
      root: `${ROOTS.DASHBOARD}/post`,
      new: `${ROOTS.DASHBOARD}/post/new`,
      details: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}`,
      edit: (title: string) => `${ROOTS.DASHBOARD}/post/${paramCase(title)}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}`,
        edit: `${ROOTS.DASHBOARD}/post/${paramCase(MOCK_TITLE)}/edit`,
      },
    },
    order: {
      root: `${ROOTS.DASHBOARD}/order`,
      details: (id: string) => `${ROOTS.DASHBOARD}/order/${id}`,
      demo: {
        details: `${ROOTS.DASHBOARD}/order/${MOCK_ID}`,
      },
    },
    job: {
      root: `${ROOTS.DASHBOARD}/job`,
      new: `${ROOTS.DASHBOARD}/job/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/job/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/job/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/job/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/job/${MOCK_ID}/edit`,
      },
    },
    tour: {
      root: `${ROOTS.DASHBOARD}/tour`,
      new: `${ROOTS.DASHBOARD}/tour/new`,
      details: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}`,
      edit: (id: string) => `${ROOTS.DASHBOARD}/tour/${id}/edit`,
      demo: {
        details: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}`,
        edit: `${ROOTS.DASHBOARD}/tour/${MOCK_ID}/edit`,
      },
    },
  },
};
