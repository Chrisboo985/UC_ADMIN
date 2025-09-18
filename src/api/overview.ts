import { axiosForApi } from 'src/utils/axios';

const axios = axiosForApi;

// 定义通用响应接口
export interface BaseResponse {
  code?: number;
  message?: string;
  [property: string]: any;
}

/**
 * responses.BondBonusStatisticsResponse
 */
export interface ResponsesBondBonusStatisticsResponse {
  /**
   * 今日分红
   */
  today_bonus?: number;
  /**
   * 总分红
   */
  total_bonus?: number;
  /**
   * 本周分红
   */
  week_bonus?: number;
  [property: string]: any;
}

/**
 * responses.BondPurchaseStatisticsResponse
 */
export interface ResponsesBondPurchaseStatisticsResponse {
  /**
   * 今日LP债券认购金额
   */
  today_lp_amount?: number;
  /**
   * 今日总认购金额
   */
  today_total_amount?: number;
  /**
   * 今日国库债券认购金额
   */
  today_treasury_amount?: number;
  /**
   * 债券总认购金额
   */
  total_amount?: number;
  /**
   * LP债券总认购金额
   */
  total_lp_amount?: number;
  /**
   * 国库债券总认购金额
   */
  total_treasury_amount?: number;
  [property: string]: any;
}

/**
 * responses.BondPurchaseByBondIDResponse
 */
export interface ResponsesBondPurchaseByBondIDResponse {
  /**
   * 债券ID
   */
  bond_id?: number;
  /**
   * 债券名称
   */
  bond_name?: string;
  /**
   * 总认购金额
   */
  total_purchase_amount?: number;
  [property: string]: any;
}

/**
 * responses.CommunityBonusStatisticsResponse
 */
export interface ResponsesCommunityBonusStatisticsResponse {
  /**
   * 今日分红
   */
  today_bonus?: number;
  /**
   * 总分红
   */
  total_bonus?: number;
  /**
   * 本周分红
   */
  week_bonus?: number;
  [property: string]: any;
}

/**
 * responses.MemberStatisticsResponse
 */
export interface ResponsesMemberStatisticsResponse {
  /**
   * 活跃会员数
   */
  active_members?: number;
  /**
   * 本月新增会员数
   */
  month_new_members?: number;
  /**
   * 今日新增会员数
   */
  today_new_members?: number;
  /**
   * 总会员数
   */
  total_members?: number;
  /**
   * 本周新增会员数
   */
  week_new_members?: number;
  [property: string]: any;
}

/**
 * responses.StakeStatisticsResponse
 */
export interface ResponsesStakeStatisticsResponse {
  /**
   * 债券质押数量
   */
  bond_stake_amount?: number;
  /**
   * 当前质押数量
   */
  current_stake_amount?: number;
  /**
   * 总质押数量
   */
  total_stake_amount?: number;
  [property: string]: any;
}

/**
 * responses.TeamBonusStatisticsResponse
 */
export interface ResponsesTeamBonusStatisticsResponse {
  /**
   * 今日分红
   */
  today_bonus?: number;
  /**
   * 总分红
   */
  total_bonus?: number;
  /**
   * 本周分红
   */
  week_bonus?: number;
  [property: string]: any;
}

/**
 * responses.UnStakeStatisticsResponse
 */
export interface ResponsesUnStakeStatisticsResponse {
  /**
   * 今日解押数量
   */
  today_unstake_amount?: number;
  /**
   * 总解押数量
   */
  total_unstake_amount?: number;
  [property: string]: any;
}

//
// ---------------------------------------------------

// 债券分红统计
export const getBondBonusStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesBondBonusStatisticsResponse }>(
    '/admin/statistic/bond_bonus'
  );

// 债券购买统计
export const getBondPurchaseStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesBondPurchaseStatisticsResponse }>(
    '/admin/statistic/bond_purchase'
  );

// 按债券ID统计购买情况
export const getBondPurchaseByBondIdAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesBondPurchaseByBondIDResponse[] }>(
    '/admin/statistic/bond_purchase_by_bond_id'
  );

// 社区分红统计
export const getCommunityBonusStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesCommunityBonusStatisticsResponse }>(
    '/admin/statistic/community_bonus'
  );

// 会员统计
export const getMemberStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesMemberStatisticsResponse }>(
    '/admin/statistic/member'
  );

// 质押统计
export const getStakeStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesStakeStatisticsResponse }>('/admin/statistic/stake');

// 团队分红统计
export const getTeamBonusStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesTeamBonusStatisticsResponse }>(
    '/admin/statistic/team_bonus'
  );

// 解押统计
export const getUnStakeStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesUnStakeStatisticsResponse }>(
    '/admin/statistic/unstake'
  );

// dao分红统计。本日 本周  本月
// /admin/statistic/dao_bonus
export const getDaoBonusStatisticsAPI = () =>
  axios.post<
    BaseResponse & { data?: { today_bonus: number; total_bonus: number; week_bonus: number } }
  >('/admin/statistic/dao_bonus');

// Rebase奖励统计
export const getRebaseInterestStatisticsAPI = () =>
  axios.post<BaseResponse & { data?: { month: number; today: number; week: number } }>(
    '/admin/statistic/rebase_interest'
  );

/**
 * tgame - 空投统计
 * /admin/tgame_statistic/air_drop_statistics
 */

export const getTgameAirDropStatisticsAPI = () =>
  axios.post<
    BaseResponse & { data?: { today_bonus: number; total_bonus: number; week_bonus: number } }
  >('/admin/tgame_statistic/air_drop_statistics');
/**
 * tgame - 债券质押数据
 * /admin/tgame_statistic/bond_stake
 */
export const getTgameBondStakeAPI = () =>
  axios.post<
    BaseResponse & { data?: { today_bonus: number; total_bonus: number; week_bonus: number } }
  >('/admin/tgame_statistic/bond_stake');

/**
 * tgame - 统计社区分红奖励数据
 * /admin/tgame_statistic/community_bonus
 */
export const getTgameCommunityBonusAPI = () =>
  axios.post<
    BaseResponse & { data?: { today_bonus: number; total_bonus: number; week_bonus: number } }
  >('/admin/tgame_statistic/community_bonus');

/**
 * tgame- 统计团队分红奖励数据
 * /admin/tgame_statistic/team_bonus
 */

export const getTgameTeamBonusAPI = () =>
  axios.post<
    BaseResponse & { data?: { today_bonus: number; total_bonus: number; week_bonus: number } }
  >('/admin/tgame_statistic/team_bonus');





/**
 * ksp - 质押数据
 * /admin/outline/pledge
 */
export const getKspPledgeAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      bond_pledge: number;
      stake_pledge: number;
      total_pledge: number;
     } }
  >('/admin/outline/pledge');


/**
 * ksp - rebase奖励数据
 * /admin/outline/rebase
 */
export const getKspRebaseAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      month_rebase_reward: number;
      today_rebase_reward: number;
      week_rebase_reward: number;
     } }
  >('/admin/outline/rebase');


/**
 * ksp - 会员数据
 * /admin/outline/member
 */
export const getKspMemberAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      month_new_members: number;
      today_new_members: number;
      total_members: number;
      week_new_members: number;
     } }
  >('/admin/outline/member');


/**
 * ksp - 天梯奖励数据
 * /admin/outline/ladder_reward
 */
export const getKspLadderRewardAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      month_ladder_reward: number,
      today_ladder_reward: number,
      week_ladder_reward: number
     } }
  >('/admin/outline/ladder_reward');
/**
 * ksp - 债券销售奖励数据
 * /admin/outline/bond_sell_reward
 * type AdminBondSellRewardRes struct {
 *    TotalReward              decimal.Decimal json:"total_reward"                // 债券销售总奖励
 *    AvailableReward          decimal.Decimal json:"available_reward"            // 债券销售可领取奖励
 *    ReceivedReward           decimal.Decimal json:"received_reward"             // 债券销售已领取奖励
 *    UnverifiedBondSellReward decimal.Decimal json:"unverified_bond_sell_reward" // 待核销债券销售奖励
 * }
 */
export const getKspBondSellRewardAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      total_reward: number,
      available_reward: number,
      received_reward: number,
      unverified_bond_sell_reward: number
     } }
  >('/admin/outline/bond_sell_reward');


/**
 * ksp - 分叉债券认购(USDT单位)
 * /admin/outline/bond_offer_buy_ksp
*/
export const getKspBondOfferBuyStatsUSDTAPI = () =>
  axios.post<
    BaseResponse & { data?: {
    /**
     * 今日LP债券认购金额
     */
    today_lp_bond_amount?: number;
    /**
     * LP180债券总认购金额
     */
    total_lp180_bond_amount?: number;
    /**
     * LP360债券总认购金额
     */
    total_lp360_bond_amount?: number;
    /**
     * LP债券总认购金额
     */
    total_lp_bond_amount?: number;
     } }
  >('/admin/outline/bond_offer_buy_ksp');

/**
 * ksp - 直推奖励数据
 * /admin/outline/`invite_reward`
 */
export const getKspInviteRewardAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      month_invite_reward: number,
      today_invite_reward: number,
      week_invite_reward: number;
     } }
  >('/admin/outline/invite_reward');



/**
 * ksp - 新增奖励数据
 * /admin/outline/incr_community_reward
 */
export const getKspIncrCommunityRewardAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      month_incr_community_reward: number,
      today_incr_community_reward: number,
      week_incr_community_reward: number;
     } }
  >('/admin/outline/incr_community_reward');




/**
 * ksp - 权重奖励数据
 * /admin/outline/community_reward
 */
export const getKspCommunityRewardAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      month_community_reward: number,
      today_community_reward: number,
      week_community_reward: number;
     } }
  >('/admin/outline/community_reward');




/**
 * ksp - 债券认购(USDT单位)
 * /admin/outline/bond_offer_buy
 */
export const getKspBondOfferBuyAPI = () =>
  axios.post<
    BaseResponse & { data?: {
      "bonds": [
        {
          "business_type": number,
          "contract_address": string,
          "control_variable": number,
          "created_at": number,
          "created_at_string": string,
          "current_discount": number,
          "discount": number,
          "enable_algorithm": boolean,
          "id": number,
          "last_purchase_at": number,
          "name": string,
          "price": number,
          "purchased_amount": number,
          "release_cycle": number,
          "roi": number,
          "status": string,
          "total_supply": number,
          "type": number,
          "type_string": string,
          "updated_at": number,
          "updated_at_string": string
        }
      ],
      "today_lp_bond_amount": number,
      "today_total_amount": number,
      "today_treasury_amount": number,
      "total_bond_amount": number,
      "total_lp_bond_amount": number,
      "total_treasury_amount": number
    } }

  >('/admin/outline/bond_offer_buy');

/**
 * 获取所有概览数据的新接口
 * /admin/outline/all
 */
export const getAdminOutlineAllAPI = () =>
  axios.post<BaseResponse & { data?: import('../sections/lgns/app/view/api').ApifoxModel }>(
    '/admin/outline/all_data'
  );

