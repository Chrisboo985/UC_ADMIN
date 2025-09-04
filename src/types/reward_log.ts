/**
 * responses.AdminCommunityRewardLogListRes
 */
export interface Response {
  list?: ResponsesAdminCommunityRewardLog[];
  total?: number;
  [property: string]: any;
}

/**
* responses.AdminCommunityRewardLog
*/
export interface ResponsesAdminCommunityRewardLog {
  /**
   * 实际增量KSP奖励金额
   */
  actual_incr_ksp_reward_amount?: number;
  /**
   * 实际增量VCKSP奖励金额
   */
  actual_incr_vcksp_reward_amount?: number;
  /**
   * 实际KSP奖励金额
   */
  actual_ksp_reward_amount?: number;
  /**
   * 实际VCKSP奖励金额
   */
  actual_vcksp_reward_amount?: number;
  /**
   * 全网总质押金额
   */
  all_network_stake_amount?: number;
  /**
   * 全网团队质押金额
   */
  all_network_team_stake_amount?: number;
  /**
   * 债券质押金额
   */
  bond_stake_amount?: number;
  /**
   * 创建时间
   */
  created_at?: number;
  /**
   * 创建时间字符串
   */
  created_at_string?: string;
  /**
   * 自定义全网团队质押金额
   */
  custom_all_network_team_stake_amount?: number;
  /**
   * 自定义增量全网团队质押金额
   */
  custom_incr_all_network_team_stake_amount?: number;
  /**
   * 日期     // 父级id
   */
  date?: string;
  /**
   * 衰减比例
   */
  decay_rate?: number;
  /**
   * 团队总质押无衰减
   */
  full_team_all_stake?: number;
  /**
   * 主键ID
   */
  id?: number;
  /**
   * 增量全网总质押金额
   */
  incr_all_network_stake_amount?: number;
  /**
   * 增量全网团队质押金额
   */
  incr_all_network_team_stake_amount?: number;
  /**
   * 增量债券质押金额
   */
  incr_bond_stake_amount?: number;
  /**
   * 增量KSP奖励金额
   */
  incr_ksp_reward_amount?: number;
  /**
   * 增量大团队总质押金额
   */
  incr_large_team_all_stake_amount?: number;
  /**
   * 增量大团队债券质押金额
   */
  incr_large_team_bond_stake_amount?: number;
  /**
   * 增量大团队补偿金额
   */
  incr_large_team_compensation_amount?: number;
  /**
   * 增量大团队质押金额
   */
  incr_large_team_stake_amount?: number;
  /**
   * 增量小团队总质押金额
   */
  incr_small_team_all_stake_amount?: number;
  /**
   * 增量小团队债券质押金额
   */
  incr_small_team_bond_stake_amount?: number;
  /**
   * 增量小团队质押金额
   */
  incr_small_team_stake_amount?: number;
  /**
   * 增量质押金额
   */
  incr_stake_amount?: number;
  /**
   * 增量团队总质押
   */
  incr_team_all_stake?: number;
  /**
   * 增量团队债券质押金额
   */
  incr_team_bond_stake_amount?: number;
  /**
   * 增量团队质押金额
   */
  incr_team_stake_amount?: number;
  /**
   * 增量VCKSP奖励金额
   */
  incr_vcksp_reward_amount?: number;
  /**
   * 是否发放奖励
   */
  is_send_reward?: boolean;
  /**
   * KSP奖励金额
   */
  ksp_reward_amount?: number;
  /**
   * KSP兑USDT比率
   */
  ksp_to_usdt?: number;
  /**
   * KSP兑VCKSP比率
   */
  ksp_to_vcksp?: number;
  /**
   * 大团队总质押金额
   */
  large_team_all_stake_amount?: number;
  /**
   * 大团队债券质押金额
   */
  large_team_bond_stake_amount?: number;
  /**
   * 大团队补偿金额
   */
  large_team_compensation_amount?: number;
  /**
   * 大团队质押金额
   */
  large_team_stake_amount?: number;
  /**
   * 用户数据
   */
  member?: Member;
  /**
   * 父级用户数据
   */
  parentMember?: Member;
  /**
   * rebase利息金额
   */
  rebase_interest_amount?: number;
  /**
   * 小团队总质押金额
   */
  small_team_all_stake_amount?: number;
  /**
   * 小团队债券质押金额
   */
  small_team_bond_stake_amount?: number;
  /**
   * 小团队质押金额
   */
  small_team_stake_amount?: number;
  /**
   * 质押金额
   */
  stake_amount?: number;
  /**
   * 团队总质押
   */
  team_all_stake?: number;
  /**
   * 团队债券质押金额
   */
  team_bond_stake_amount?: number;
  /**
   * 团队质押金额
   */
  team_stake_amount?: number;
  /**
   * 更新时间
   */
  updated_at?: number;
  /**
   * 更新时间字符串
   */
  updated_at_string?: string;
  /**
   * VCKSP奖励金额
   */
  vcksp_reward_amount?: number;
  /**
   * 权重系数
   */
  weight?: number;
  [property: string]: any;
}

/**
* 用户数据
*
* responses.CommunityRewardLogMemberInfo
*
* 父级用户数据
*/
export interface Member {
  /**
   * 用户地址
   */
  address?: string;
  /**
   * id
   */
  id?: number;
  [property: string]: any;
}
