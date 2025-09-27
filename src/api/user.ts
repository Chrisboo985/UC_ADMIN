import { axiosForApi } from 'src/utils/axios';
import type { IDatePickerControl } from 'src/types/common';

const axios = axiosForApi;

export interface BaseResponse<T = any> {
  code?: number;
  message?: string;
  data?: T;
}

// 创建新用户 post请求
export interface MemberIndexRequest {
  address?: string;
  created_at_end?: number;
  created_at_start?: number;
  parent_code?: string | '' | null | undefined;
  id?: number | '' | null | undefined;
  order_direction?: string;
  order_field?: string;
  page: number; // 必需
  page_size: number; // 必需
}

// 单个成员的接口
export interface Member {
  address: string;
  created_at: number;
  created_at_string: string;
  id: number;
  parent_code: string;
  warn_amount?: string;
  stake_amount?: string;
  tron_address: string;
  remark: string;
  updated_at: number;
  updated_at_string: string;
}

// 包含成员列表和总数的接口
export interface MemberListData {
  list: Member[];
  total: number;
}

export const getMemberIndexAPI = (data: MemberIndexRequest) =>
  axios.post<MemberListData>('/admin/member/list', data);

export const getMemberNetworkAPI = (data: MemberIndexRequest) =>
  axios.post<MemberListData>('/admin/member/list', data);

// 添加新的接口函数
export function setPledgeAPI(data: { id: number; pledge_amount: number }) {
  return axios.post('/api/member/pledge', data);
}

// 批量保存或更新用户债券比率
export const batchSaveBondRatesAPI = (data: any) =>
  axios.post('/admin/member/batch_save_bond_rates', data);

// 提现债券分红
export const withdrawBondBonusAPI = (data: any) =>
  axios.post('/admin/member/bond_bonus_withdraw', data);

// 添加备注
export const setRemarkAPI = (data: any) => axios.post('/admin/member/update_remark', data);

// 移除涡轮
export const removeTurbineAPI = (data: any) => axios.post('/admin/member/turbine_remove', data);

// 设置会员类型
export const setMemberTypeAPI = (data: {
  /**
   * 账号地址
   */
  address?: string;
  /**
   * 会员ID
   */
  id?: number;
  /**
   * 会员类型：1 默认，2 运营中心，3 社区
   */
  member_type: 1 | 2 | 3;
}) => axios.post('/admin/member/update_type', {
  id: data.id,
  address: data.address,
  type: Number(data.member_type),
});

// 设置团队类型
export const setTeamTypeAPI = (data: {
  /**
   * 会员ID
   */
  member_id: number;
  /**
   * 会员类型：1普通 2公会 3社区
   */
  team_type: 1 | 2 | 3;
}) => axios.post('/admin/member/set_team_type', { ...data, team_type: Number(data.team_type) });
// 设置团队备注
export const setTeamRemarkAPI = (data: {
  /**
   * 会员ID
   */
  member_id: number | string;
  /**
   * 会员类型：1普通 2公会 3社区
   */
  remark: string;
}) => axios.post('/admin/member/set_team_remark', { ...data });

// 工会列表
export const getUnionListAPI = (data: {
  address?: string;
  date_timestamp: number;
  page: number;
  page_size: number;
  parent_team_id?: number;
}) => axios.post('/admin/member/guild_team_index', data);
// 社区列表
export const getCommunityListAPI = (data: {
  address?: string;
  date_timestamp: number;
  page: number;
  page_size: number;
  parent_team_id?: number;
}) => axios.post('/admin/member/community_team_index', data);

/**
 * 团队债券业绩
 * /admin/bond_purchase/team_index
 */

interface TeamIndexRequestParams {
  created_at_end?: number;
  created_at_start?: number;
  member_address?: string;
  page: number;
  page_size: number;
}

/**
 * models.BondPurchase
 */
export interface TeamIndexResponse {
  /**
   * 关联的债券
   */
  bond?: Bond;
  /**
   * 债券ID
   */
  bond_id?: number;
  /**
   * 债券类型
   */
  bond_type?: number;
  /**
   * 可领取数量
   */
  claimable?: number;
  /**
   * 已领取数量
   */
  claimed_amount?: number;
  /**
   * 合约地址
   */
  contract_address?: string;
  /**
   * 创建时间
   */
  created_at?: number;
  /**
   * 创建时间字符串
   */
  created_at_string?: string;
  /**
   * 折扣
   */
  discount?: number;
  /**
   * 应得数量
   */
  expected_amount?: number;
  /**
   * 唯一哈希
   */
  hash?: string;
  /**
   * 购买记录ID
   */
  id?: number;
  /**
   * 利息
   */
  interest?: number;
  /**
   * 是否已全部领取
   */
  is_fully_claimed?: boolean;
  /**
   * 会员地址
   */
  member_address?: string;
  /**
   * 会员ID
   */
  member_id?: number;
  /**
   * 购买数量
   */
  purchase_amount?: number;
  /**
   * 购买时间
   */
  purchase_at?: number;
  /**
   * 购买时间字符串
   */
  purchase_at_string?: string;
  /**
   * 释放周期
   */
  release_cycle?: number;
  /**
   * 释放中数量
   */
  releasing?: number;
  /**
   * 更新时间
   */
  updated_at?: number;
  /**
   * 更新时间字符串
   */
  updated_at_string?: string;
}

/**
 * 关联的债券
 *
 * models.Bond
 */
interface Bond {
  /**
   * 合约地址
   */
  contract_address?: string;
  /**
   * 控制变量
   */
  control_variable?: number;
  /**
   * 创建时间
   */
  created_at?: number;
  /**
   * 创建时间字符串
   */
  created_at_string?: string;
  /**
   * 当前折扣
   */
  current_discount?: number;
  /**
   * 可写字段
   */
  discount?: number;
  /**
   * 启用算法
   */
  enable_algorithm?: boolean;
  /**
   * 债券记录
   */
  id?: number;
  /**
   * 最近购买时间
   */
  last_purchase_at?: number;
  /**
   * 债券名称
   */
  name?: string;
  /**
   * 价格
   */
  price?: number;
  /**
   * 已购买数量
   */
  purchased_amount?: number;
  /**
   * 释放周期
   */
  release_cycle?: number;
  /**
   * 当前折扣
   */
  roi?: number;
  /**
   * 状态
   */
  status?: string;
  /**
   * 债券总发行量
   */
  total_supply?: number;
  /**
   * 债券类型
   */
  type?: number;
  /**
   * 只读字段
   */
  type_string?: string;
  /**
   * 更新时间
   */
  updated_at?: number;
  /**
   * 更新时间字符串
   */
  updated_at_string?: string;
}

export function getTeamIndexAPI(data: TeamIndexRequestParams) {
  return axios.post<{
    five_days: string;
    fifty_days: string;
    hundred_days: string;
    two_hundred_days: string;
    three_hundred_days: string;
    list: TeamIndexResponse[];
    total: number;
  }>('/admin/bond_purchase/team_index', data);
}

// 设置会员CK包最大购买次数
export const setCkPurchaseMaxTimesAPI = (data: any) =>
  axios.post('/admin/member/set_ck_purchase_max_times', data);

// 设置会员CK白名单状态
export const setCkWhiteListAPI = (data: any) => axios.post('/admin/member/set_ck_white', data);

// 设置会员游戏难度系数
export const setGameDifficultyCoefficientAPI = (data: any) =>
  axios.post('/admin/member/set_difficulty', data);

// 核销债券销售奖励
export const verifyBondSellRewardAPI = (data: { amount: number; id: number }) =>
  axios.post<BaseResponse<boolean>>('/admin/member/verify_bond_sell_reward', data);

// 修改债券销售奖励权限
export const updateBondSellRewardAuthAPI = (data: { id: number; is_allow_bond_sell_reward: string }) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_bond_sell_reward_auth', data);

// 用户更新接口
export interface UpdateUserRequest {
  id: number;
  remark?: string;
}

// 查询会员业绩 /admin/member/reward_search
export const getRewardSearchAPI = (data: {
  address?: string;
  created_at_end?: number;
  created_at_start?: number;
}) => axios.post('/admin/member/reward_search', data);



// 更新会员类型
export const updateUserTypeAPI = (data: { id: number; member_type: number }) =>
  axios.post('/admin/member/update_type', data);




// 下级ksp出入金数据列表
export const getMemberCommunityKspSubAPI = (data: any) => axios.post('/admin/member/member_community_ksp_sub', data);


// 下级社区质押数据列表
export const getMemberCommunityStakeSubAPI = (data: any) => axios.post('/admin/member/member_community_stake_sub', data);


// 社区债券购买数据列表
export const getMemberCommunityBondSubAPI = (params: any) => axios.post<any>('/admin/member/member_community_bond_sub', params);




// 社区奖励日志列表
export const getCommunityRewardLogListAPI = (params: any) => axios.post<any>('/admin/community_reward_log/list', params);




// 业绩汇总数据列表
export const getCommunityBondWithKspSubAPI = (params: any) => axios.post<any>('/admin/member/community_bond_with_ksp_sub', params);
// 社区有效业绩列表
export const getMemberPerformanceList = (params: {
      /**
     * 结束时间
     */
      created_at_end?: number;
      /**
       * 开始时间
       */
      created_at_start?: number;
      /**
       * 用户地址
       */
      member_address?: string;
      /**
        * 用户编码
        */
      member_code?: string;
      /**
        * 查询单个用户（运营中心下的社区：false；单个用户：true）
        */
      only_member?: boolean;
      page: number;
      page_size: number;
}) => axios.post<any>('/admin/member/performance_list', params);

// 社区链上出入金记录
export const getMemberPerformanceSwap = (params: {
      /**
     * 结束时间
     */
      created_at_end?: number;
      /**
       * 开始时间
       */
      created_at_start?: number;
      /**
       * 用户地址
       */
      member_address?: string;
      /**
        * 用户编码
        */
      member_code?: string;
      page: number;
      page_size: number;
      /**
       * 交易类型 send 出金，receive 入金
       */
      trans_type: 'send' | 'receive' | '';
      /**
       * 查询单个用户（运营中心/社区：false；单个用户：true）
       */
      only_member?: boolean;
}) => axios.post<any>('/admin/member/performance_swap', params);

// 社区债券购买记录
export const getMemberPerformanceBondPurchase = (params: {
      /**
      * 结束时间
      */
      created_at_end?: number;
      /**
        * 开始时间
        */
      created_at_start?: number;
      /**
        * 用户地址
        */
      member_address?: string;
      /**
        * 用户编码
        */
      member_code?: string;
      /**
        * 查询单个用户（运营中心/社区：false；单个用户：true）
        */
      only_member?: boolean;
      /**
       * 购买方式
       * 0 全部，1 ksp分叉买入 2 dapp买入
       */
      purchase_method: '0' | '1' | '2';
      page: number;
      page_size: number;
}) => axios.post<any>('/admin/member/performance_bond_purchase', params);

// 社区债券购买汇总
export const getMemberPerformanceBondPurchaseGather = (params: {
      /**
      * 结束时间
      */
      created_at_end?: number;
      /**
        * 开始时间
        */
      created_at_start?: number;
      /**
       * 购买方式
       * 0 全部，1 ksp分叉买入 2 dapp买入
       */
      purchase_method?: 0 | 1 | 2;
}) => axios.post<any>('/admin/member/performance_bond_purchase_gather', params);

// 社区出入金汇总
export const getMemberPerformanceBondWithSwap = (params: {
      /**
      * 结束时间
      */
      created_at_end?: number;
      /**
        * 开始时间
        */
      created_at_start?: number;
      /**
        * 用户地址
        */
      member_address?: string;
      /**
        * 用户编码
        */
      member_code?: string;
      /**
        * 查询单个用户（运营中心/社区：false；单个用户：true）
        */
      only_member?: boolean;
      page: number;
      page_size: number;
}) => axios.post<any>('/admin/member/performance_bond_with_swap', params);

/**
 * 修改SCR阈值权限 enable  disable
 */
export enum IsEnableScrCheck {
  Disable = 'disable',
  Enable = 'enable',
}

/**
 * requests.UpdateScrCheckReq
 */
export interface UpdateScrCheckPayload {
  /**
   * 会员ID
   */
  id?: number;
  /**
   * 修改SCR阈值权限 enable  disable
   */
  is_enable_scr_check?: IsEnableScrCheck;
}

// API function to update SCR check permission
export const updateScrCheckAPI = (data: UpdateScrCheckPayload) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_scr_check', data);

 interface UpdateFixCommunityScorePayload {
  /**
   * 调整社区分数
   */
  fix_community_score?: number;
  /**
   * 会员ID
   */
  id?: number;
  [property: string]: any;
}
export const updateFixCommunityScoreAPI = (data: UpdateFixCommunityScorePayload) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_fix_community_score', data);

/**
 * 积分白名单
 * /admin/member/update_score_white
*/
/**
 * requests.UpdateScoreWhiteReq
 */
export interface Request {
  /**
   * 会员ID
   */
  id?: number;
  /**
   * 积分白名单状态：white 白名单，non_white 非白名单
   */
  is_score_white?: IsScoreWhite;
  [property: string]: any;
}

/**
* 积分白名单状态：white 白名单，non_white 非白名单
*/
export enum IsScoreWhite {
  NonWhite = "non_white",
  White = "white",
}

export const updateScoreWhiteAPI = (data: Request) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_score_white', data);

/**
 * 重置密码接口
 * /admin/member/reset_password
 */
export interface ResetPasswordRequest {
  /**
   * 用户id
   */
  id: number;
   /**
   * 担保人
   */
  surety: string;
  /**
   * 登录密码
   */
  login_pass: string;
  /**
   * 交易密码
   */
  true_pass: string;
}

export const resetPasswordAPI = (data: ResetPasswordRequest) =>
  axios.post<BaseResponse<boolean>>('/admin/member/reset_password', data);


/**
 * 更绑地址接口
 * /admin/member/update_address
 */
export interface UpdateAddressRequest {
  /**
   * 用户id
   */
  id: number;
  /**
   * 新绑定地址
   */
  new_address: string;
  /**
   * 担保人
   */
  surety: string;
}
/**
 * 资金流水请求接口
 * /admin/member/fund_asset_flow
 */
export interface FundAssetFlowRequest {
  /**
   * 用户id
   */
  id: number;
  /**
   * 查询日期 YYYY-MM-DD
   */
  date: string;
  page: number;
  page_size: number;
  type: string;
}

/**
 * 资金流水响应数据项
 */
export interface FundAssetFlowItem {
  id: number;
  username?: string;
  address?: string;
  amount?: number;
  type?: string;
  created_at?: string;
  updated_at?: string;
  remark?: string;
}

/**
 * 资金流水响应数据
 */
export interface FundAssetFlowResponse {
  list: FundAssetFlowItem[];
  total: number;
}

export const updateMemberAddressAPI = (data: UpdateAddressRequest) =>
  axios.post<BaseResponse<boolean>>('/admin/member/address_modify', data);

export const fundAssetFlowAPI = (data: FundAssetFlowRequest) =>
  axios.post<FundAssetFlowResponse>('/admin/member/fund_asset_flow', data);

// 更改上级接口
export const updateParentIdAPI = (data: { id: number; parent_code: string }) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_parent_id', data);

export const updateLevelAPI = (data: { id: number; star_level: number; virtual_level: number }) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_level', data);

// 更新用户状态接口
export interface UpdateUserStatusRequest {
  /** 用户ID */
  id: number;
  /** 用户状态: normal-正常, blocked-封禁 */
  status: 'normal' | 'blocked';
}

export const updateUserStatusAPI = (data: UpdateUserStatusRequest) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_status', data);

// 批量更新用户网络状态
export interface UpdateMemberNetStatusRequest {
  id: number;
  status: 'normal' | 'blocked';
}

export const updateMemberNetStatusAPI = (data: UpdateMemberNetStatusRequest) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_member_net_status', data);

// 更新用户地址状态接口
export interface UpdateMemberAddressStatusRequest {
  id: number;
  address_status: 'normal' | 'blocked';
}

export const updateMemberAddressStatusAPI = (data: UpdateMemberAddressStatusRequest) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_member_address_status', data);

// 更新用户提现状态接口
export interface UpdateMemberWithdrawStatusRequest {
  id: number;
  withdraw_status: 'normal' | 'blocked';
}

export const updateMemberWithdrawStatusAPI = (data: UpdateMemberWithdrawStatusRequest) =>
  axios.post<BaseResponse<boolean>>('/admin/member/update_member_withdraw_status', data);

// 查询修改推荐人记录接口
export interface ParentModifyLogRequest {
  created_at_start?: number; // 开始时间
  member?: string; // 用户编码或者地址
  new_parent?: string; // 新父级编码
  old_parent?: string; // 旧父级编码
  created_at_end?: number; // 结束时间
  page: number; // 页码
  page_size: number; // 每页数量
}

export interface ParentModifyLogItem {
  id?: number; // 记录ID
  member?: {
    member_code?: string; // 用户编码
    h_username?: string; // 登录名
    h_nickname?: string; // 用户昵称
    address?: string; // 会员地址
  };
  new_parent?: {
    member_code?: string; // 新推荐人编码
    h_username?: string; // 新推荐人登录名
    h_nickname?: string; // 新推荐人昵称
    address?: string; // 新推荐人地址
  };
  old_parent?: {
    member_code?: string; // 旧推荐人编码
    h_username?: string; // 旧推荐人登录名
    h_nickname?: string; // 旧推荐人昵称
    address?: string; // 旧推荐人地址
  };
  created_at_string?: string; // 创建时间
  updated_at_string?: string; // 更新时间
  migration_count?: number; // 迁移的网体用户数
  team_power_total?: number; // 迁移的网体总算力
  new_parent_ids_count?: number; // 用户新父级链总数
  old_parent_ids_count?: number; // 用户旧父级链总数
}

export interface ParentModifyLogResponse {
  list: ParentModifyLogItem[];
  total: number;
}

export const getParentModifyLogAPI = (data: ParentModifyLogRequest) =>
  axios.post<ParentModifyLogResponse>('/admin/parent_modify_log/list', data);

// 查询上级接口
export interface ParentListRequest {
  parent: string; // 上级编码或地址
  page?: number;
  page_size?: number;
}

export interface ParentListItem {
  /** 地址 */
  address?: string;
  /** 地址状态 */
  address_status?: string;
  /** apd代币 */
  apd?: number;
  /** APD价值USDT金额 */
  apd_to_usdt_amount?: number;
  /** 商家积分 */
  bp?: number;
  /** 消费积分 */
  cp?: number;
  /** 账户 */
  h_account?: string;
  /** 昵称 */
  h_nickname?: string;
  /** 账号 */
  h_username?: string;
  /** 健康积分 */
  hp?: number;
  /** models.Member */
  id: number;
  /** 用户登录ip */
  ip?: string;
  /** 是否激活 */
  is_active?: string;
  /** 是否商家 */
  is_business?: boolean;
  /** 大团队累积算力 */
  large_team_power_total?: number;
  /** 等级 p0-p5 D1-D10 */
  level?: number;
  /** 出局额度 */
  mc?: number;
  /** 用户code */
  member_code?: string;
  /** 上级地址 */
  parent_address?: string;
  /** 父级层级 */
  parent_level?: number;
  /** 有效算力 */
  power?: number;
  /** 原注册积分 */
  rp?: number;
  /** 小团队累积算力 */
  small_team_power_total?: number;
  /** 星级 s1-s10 */
  star_level?: number;
  /** 用户状态 */
  status?: string;
  /** 团队累积算力 */
  team_power_total?: number;
  /** 累积算力 */
  total_power?: number;
  /** 交易积分 */
  tp?: number;
  /** 用户积分 */
  up?: number;
  /** 虚拟等级 p0-p5 D1-D10 */
  virtual_level?: number;
  /** wapd代币 */
  wapd?: number;
  /** 提现状态 */
  withdraw_status?: string;
  /** 私募积分 */
  xapd?: number;
  /** XAPD价值USDT金额 */
  xapd_to_usdt_amount?: number;
}

export interface ParentListResponse {
  list: ParentListItem[];
  total: number;
}

export const getParentListAPI = (data: ParentListRequest) =>
  axios.post<ParentListResponse>('/admin/member/parent_list', data);

// 转账记录查询接口
export interface TransferLogRequest {
  created_at_start?: number; // 开始时间
  created_at_end?: number; // 结束时间
  from_member?: string; // 转出会员编码或者地址
  to_member?: string; // 转入会员编码或地址
  hash?: string; // 交易哈希
  type?: string; // 转账类型
  page: number; // 页码
  page_size: number; // 每页数量
}

export interface TransferLogItem {
  id?: number; // 记录ID
  amount?: number; // 转账金额
  created_at_string?: string; // 创建时间
  from_member_id?: number; // 转出会员ID
  from_member_code?: string; // 转出会员编码
  from_member_username?: string; // 转出会员账号
  from_member_nickname?: string; // 转出会员昵称
  from_member_address?: string; // 转出会员地址
  to_member_id?: number; // 转入会员ID
  to_member_code?: string; // 转入会员编码
  to_member_username?: string; // 转入会员账号
  to_member_nickname?: string; // 转入会员昵称
  to_member_address?: string; // 转入会员地址
  hash?: string; // 交易哈希
  type?: string; // 转账类型
  remark?: string; // 备注
}

export interface TransferLogResponse {
  list: TransferLogItem[];
  total: number;
}

export const getTransferLogAPI = (data: TransferLogRequest) =>
  axios.post<TransferLogResponse>('/admin/transfer_log/list', data);

export interface ConfirmNodeSubscriptionRequest {
  address: string;
  hash: string;
  product_id: number;
  quantity: number;
  tx_at: number;
}

export const confrimNodeSubscriptionAPI = (data: ConfirmNodeSubscriptionRequest) => axios.post('/admin/member/node_purchase', data)

export type GetProductListResponse = Array<{
  id: number;
  name: string;
  price: string;
}>

export const getProductList = () => axios.post<GetProductListResponse>('/admin/product/all')

export type getNodeSubscriptionLogListRequest = {
  page: number;
  page_size: number;
}
export type getNodeSubscriptionLogListResponse = {
  list: Array<{
    address: string;
    admin_id: number;
    amount: number;
    hash: string;
    product_id: number;
    quantity: number;
    remark: string;
    tx_at: number;
    tx_at_string: string;
    product: {
      name: string;
    };
  }>;
  total: number;
}

export const getNodeSubscriptionLogListAPI = (data: getNodeSubscriptionLogListRequest) => axios.post<getNodeSubscriptionLogListResponse>('/admin/admin_log/node_purchase_log_list', data)

export type getMemberListReqeust = {
  address: string;
  type: UserType;
}

/** 用户类型 */
export const enum UserType {
  /** 全部 */
  All = 'all',

  /** 普通用户 */
  Normal = 'normal',

  /** 社区用户 */
  Community = 'community',

  /** 0号线 */
  Line0 = 'line0'
}

export type getMemberListAPIResponse = {
  list: Array<{
    address: string;
    dynamic_reward: number;
    ip: string;
    level: number;
    level_up_reward: number;
    parent_id: string;
    parent_member?: {
      address: string;
    };
    power: number;
    receive_reward: number;
    receive_reward_usdt: number;
    remark: string;
    team_power: number;
    team_usdt_recharge_amount: number;
    usdt_recharge_amount: number;
    withdraw_limit: number;
    type: UserType;
    id: number;
    open_virtual_region: boolean;
  }>;
  total: number;
}

export const getMemberListAPI = (data: getMemberListReqeust) => axios.post<getMemberListAPIResponse>('/admin/member/list', data)

export type setUserTypeRequest = {
  member_id: number;
  type: UserType;
}


export const getRechargeList = (data: {
  created_at_start: number | null;
  created_at_end: number | null;
  member_address: string;
  page: number;
  page_size: number;
}) => axios.post<{
  list: Array<{
    address: string;
    amount: string;
    created_at_string: string;
    deposit_address: string;
    remark: string;
    transaction_hash: string;
    transaction_id: string;
    chain_id: string;
    token_id: string;
  }>;
  total: number;
  total_purchase: string;
}>('/admin/deposit_record/list', data)



export interface OrderListRequest {
  created_at_end?: number;
  created_at_start?: number;
  member_address?: string;
  page: number;
  page_size: number;
  product_id?: number;
}

export interface OrderListResponse {
  total_purchase: number | string;
  list: any[];
  total: number;
}

export const getOrderListAPI = (data: OrderListRequest) => axios.post<OrderListResponse>('/admin/order/list', data)

export const getMenuCommunityAchievementList = (data: {
  community_address: string;
  created_at_end: number | null;
  created_at_start: number | null;
}) => axios.post<{
  list: Array<{
    is_top_member: boolean;
    member_address: string;
    member_id: number;
    purchase_amount: number;
    purchase_count: number;
  }>;
  total: number;
}>('/admin/member/network_community_purchase', data)

export const setLine0UserType = (data: { member_id: number }) => axios.post('/admin/member/set_top_member', data)
export const setUserTypeAPI = (data: setUserTypeRequest) => axios.post('/admin/member/set_type', data)
export const getCommunityRewardsList = (data: {
  date?: string;
  member_address: string;
  page: number;
  page_size: number;
}) => axios.post<{
  list: Array<{
    created_at_string: string;
    dynamic_rate: string;
    dynamic_reward_amount: string;
    large_team_power: string;
    level_up_reward_amount: string;
    member_level: number;
    open_virtual_region: boolean;
    power: string;
    small_team_all_power: string;
    team_power: string;
    uc_to_usdt: string;
    member: {
      address: string;
    };
  }>;
  total: number;
}>('/admin/member/community_reward', data)
export const setVirtualZoneOpenStatus = (data: { member_id: number; open_virtual_region: boolean; }) => axios.post('/admin/member/update_virtual_region', data)
export const getCommunitySubsidy = (data: {
  member_address: string;
  top_member_address: string;
  page: number;
  page_size: number;
}) => axios.post<{
  list: Array<{
    community_member: {
      address: string;
    };
    top_member?: {
      address: string;
    };
    threshold: string;
    reward: string;
    created_at: number;
    created_at_string: string;
    is_send: boolean;
    id: number;
  }>;
  total: number;
}>('/admin/member/community_subsidy', data)
export const communitySubsidySend = (data: { id: number; }) => axios.post('/admin/member/community_subsidy_send', data)