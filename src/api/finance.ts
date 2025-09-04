import { axiosForApi } from 'src/utils/axios';

const axios = axiosForApi;
/**
 * 定义基础响应接口
 */
export interface BaseResponse {
  code?: number;
  message?: string;
  [property: string]: any;
}

/**
 * 债券购买记录请求参数
 */
export interface BondPurchaseRequest {
  /**
   * 债券ID
   */
  bond_id?: number;
  /**
   * 创建时间结束
   */
  created_at_end?: number;
  /**
   * 创建时间开始
   */
  created_at_start?: number;
  /**
   * 用户ID
   */
  member_id?: number;
  /**
   * 排序方向 asc:升序;desc:降序
   */
  order_direction?: string;
  /**
   * 排序字段 id
   */
  order_field?: string;
  /**
   * 购买方式
   * 0 全部，1 ksp分叉买入，2 dapp买入
   */
  purchase_method?: 0 | 1 | 2;
  page: number;
  page_size: number;
}

/**
 * 质押记录请求参数
 */
export interface StakeRequest {
  /**
   * 用户地址
   */
  address?: string;
  /**
   * 创建时间结束
   */
  created_at_end?: number;
  /**
   * 创建时间开始
   */
  created_at_start?: number;
  /**
   * 交易hash
   */
  hash?: string;
  /**
   * 用户ID
   */
  member_id?: number;
  /**
   * 排序方向 asc:升序;desc:降序
   */
  order_direction?: string;
  /**
   * 排序字段 id
   */
  order_field?: string;
  page: number;
  page_size: number;
}

// 在文件顶部添加类型定义
export interface ResponsesPagedResponseArrayModelsStake {
  list: any[];
  total: number;
  page: number;
  page_size: number;
}

/**
 * 质押记录列表
 */
export const getStakeIndexAPI = (data: StakeRequest) =>
  axios.post<BaseResponse & { data?: ResponsesPagedResponseArrayModelsStake }>(
    '/admin/stake/index',
    data
  );

/**
 * 债券购买记录列表
 */
export const getBondPurchaseIndexAPI = (data: BondPurchaseRequest) =>
  axios.post<BaseResponse & { data?: ResponsesPagedResponseArrayModelsStake }>(
    '/admin/bond_purchase/list',
    data
  );

/**
 * 获取债券购买数据
 */
export const getBondPurchaseDataAPI = (data: BondPurchaseRequest) => axios.post<BaseResponse>('/admin/bond_purchase/data', data);
 
/**
 *获取极差分红比例配置列表
 */
export const getCommunityBonusRateIndexAPI = () =>
  axios.post<BaseResponse & { data?: ResponsesPagedResponseArrayModelsStake }>(
    '/admin/community_bonus_rate/index'
  );

/**
 * 更新社区分红比例
 * /admin/community_bonus_rate/update
 */

export const updateCommunityBonusRateAPI = (data: {
  id: number;
  rate: number;
}) => axios.post<BaseResponse>('/admin/community_bonus_rate/update', data);

/**
 * 获取层级分红比例配置列表
 * /admin/team_bonus_rate/index
 */

export interface ModelsTeamBonusRateConfig {
  created_at?: number;
  created_at_string?: string;
  id?: number;
  /**
   * 分红比率
   */
  rate?: number;
  /**
   * 个人质押数量
   */
  stake_amount?: number;
  /**
   * 交互层数
   */
  title?: string;
  updated_at?: number;
  updated_at_string?: string;
  /**
   * 权重
   */
  weights?: number;
  [property: string]: any;
}
export const getTeamBonusRateIndexAPI = () =>
  axios.post<BaseResponse & { data?: ModelsTeamBonusRateConfig }>(
    '/admin/team_bonus_rate/index'
  );

/**
 * 更新层级分红比例
 * /admin/team_bonus_rate/update
 */
export const updateTeamBonusRateAPI = (data: {
  id: number;
  rate: number;
}) => axios.post<BaseResponse>('/admin/team_bonus_rate/update', data);
// 债券分红流水列表
export interface BondBonusListAPIRequest {
  /**
   * 会员地址
   */
  address?: string;
  /**
   * 结束时间
   */
  end_time?: string;
  /**
   * 会员ID
   */
  member_id?: string;
  /**
   * 页码
   */
  page: number;
  /**
   * 每页数量
   */
  page_size: number;
  /**
   * 开始时间
   */
  start_time?: string;
}

export interface RequestsBondBonusIndexItem {
  /**
   * 会员地址
   */
  address?: string;
  /**
   * 变动后金额
   */
  amount_after?: number;
  /**
   * 变动前金额
   */
  amount_before?: number;
  /**
   * 变动金额
   */
  amount_change?: number;
  /**
   * 资产类型
   */
  asset_type?: string;
  /**
   * 创建时间
   */
  created_at?: string;
  /**
   * 事件
   */
  event?: string;
  /**
   * 事件ID
   */
  event_id?: number;
  /**
   * 事件表
   */
  event_table?: string;
  /**
   * 交易哈希
   */
  hash?: string;
  /**
   * ID
   */
  id?: number;
  /**
   * 会员ID
   */
  member_id?: number;
  /**
   * 备注
   */
  remarks?: string;
  /**
   * 状态
   */
  status?: number;
  [property: string]: any;
}
export const getBondBonusListAPI = (data: BondBonusListAPIRequest) =>
  axios.post<{list: RequestsBondBonusIndexItem[], total: number}>('/admin/transaction_log/bond_bonus_index', data);