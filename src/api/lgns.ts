import { ApiResponse, axiosForApi } from 'src/utils/axios';

import type { ResponsesPagedResponseModelsRebaseRateQueue } from 'src/types/rebase';
import ApiPublicTypes from './public.types'

const axios = axiosForApi;

// 定义基础响应接口
export interface BaseResponse {
  key: string;
  value: string | boolean;
}

// 定义债券数据接口
export interface BondData {
  id: number;
  contract_address: string;
  new_contract_address?: string;
  name: string;
  type: number;
  purchased_amount: string;
  release_cycle: number;
  control_variable: string;
  enable_algorithm: boolean;
  total_supply: string;
  current_discount?: string;
  last_purchase_at: number;
  price: string;
  status: string;
  created_at: number;
  updated_at: number;
  discount: string;
  roi: string;
  type_string: string;
  created_at_string: string;
  updated_at_string: string;
  business_type: number;
}

/**
 * 获取算法Rebase利率
 * @returns Promise<BaseResponse> 返回算法Rebase利率信息
 */
export const getAlgorithmRebaseRateAPI = () =>
  axios.post<BaseResponse>('/admin/config/get_algorithm_rebase_rate');

// 定义算法Rebase利率请求接口
export interface AlgorithmRebaseRateRequest {
  rate: number; // Rebase利率
}

// 定义分发信息请求接口
export interface DistributeInfoRequest {
  info: number; // 分发信息
}

// 定义启用算法Rebase请求接口
export interface EnableAlgorithmRebaseRequest {
  enabled: boolean; // 是否启用
}

// 定义预览Rebase利率请求接口
export interface PreviewRebaseRateRequest {
  distribute_info: number; // 预览Rebase利率
}

/**
 * 获取Lgns数据
 * @returns Promise<BaseResponse> 返回Lgns数据
 */
export const getLgnsDataAPI = () => axios.post<BaseResponse>('/admin/lgns/get_lgns_data');

/**
 * 获取分发信息
 * @returns Promise<BaseResponse> 返回分发信息
 */
export const getDistributeInfoAPI = () =>
  axios.post<BaseResponse>('/admin/config/get_distribute_info');

/**
 * 获取预览Rebase利率
 * @returns Promise<BaseResponse> 返回预览Rebase利率
 */
export const getPreviewRebaseRateAPI = (data: PreviewRebaseRateRequest) =>
  axios.post<BaseResponse>('/admin/config/get_preview_rebase_rate', data);

/**
 * 获取是否启用算法Rebase
 * @returns Promise<BaseResponse> 返回启用状态
 */
export const getEnableAlgorithmRebaseAPI = () =>
  axios.post<BaseResponse>('/admin/config/get_enable_algorithm_rebase');

/**
 * 获取Rebase利率
 * @returns Promise<BaseResponse> 返回Rebase利率信息
 */
export const getRebaseRateAPI = () => axios.post<BaseResponse>('/admin/config/get_rebase_rate');

/**
 * 获取Rebase利率
 * @returns Promise<BaseResponse> 返回Rebase利率信息
 */
export const getCurrentRebaseRateAPI = () =>
  axios.post<BaseResponse>('/admin/config/get_current_rebase_rate');

/**
 * 设置算法Rebase利率
 * @param data AlgorithmRebaseRateRequest 请求参数
 * @returns Promise<BaseResponse> 返回设置结果
 */
export const setAlgorithmRebaseRateAPI = (data: AlgorithmRebaseRateRequest) =>
  axios.post<BaseResponse>('/admin/config/set_algorithm_rebase_rate', data);

/**
 * 设置分发信息
 * @param data DistributeInfoRequest 请求参数
 * @returns Promise<BaseResponse> 返回设置结果
 */
export const setDistributeInfoAPI = (data: DistributeInfoRequest) =>
  axios.post<BaseResponse>('/admin/config/set_distribute_info', data);

/**
 * 设置是否启用算法Rebase
 * @param data EnableAlgorithmRebaseRequest 请求参数
 * @returns Promise<BaseResponse> 返回设置结果
 */
export const setEnableAlgorithmRebaseAPI = (data: EnableAlgorithmRebaseRequest) =>
  axios.post<BaseResponse>('/admin/config/set_enable_algorithm_rebase', data);

/**
 * 设置Rebase利率
 * @param data AlgorithmRebaseRateRequest 请求参数
 * @returns Promise<BaseResponse> 返回设置结果
 */
export const setRebaseRateAPI = (data: AlgorithmRebaseRateRequest) =>
  axios.post<BaseResponse>('/admin/config/set_rebase_rate', data);

/**
 * 获取债券列表
 */
export const getBondIndexAPI = (data: any) => axios.post<{list:BondData[]}>('/admin/bond/list', data);

/**
 * 设置债券控制变量 - 开启算法控制的 “BCV”字段
 */
export const setControlVariableAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/bond/set_control_variable', data);

/**
 * 设置债券价格  - 不开算法控制的 “价格”字段
 */
export const setBondPriceAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/bond/set_price', data);

/**
 * 设置债券折扣率  - 不开算法控制的 “折扣率”字段
 */
export const setBondDiscountAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/bond/update', data);

/**
 * 设置债券状态 - 公开
 */
export const setBondStatusAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/bond/control', data);

/**
 * 设置债券启用算法
 */
export const setEnableAlgorithmAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/bond/set_enable_algorithm', data);

/*
 * 创建 RebaseRateQueue
 */
export const createRebaseRateQueueAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/rebase_rate_queue/create', data);

/**
 * 获取 RebaseRateQueue 列表（分页）
 */
export const getRebaseRateQueueIndexAPI = (data: any) =>
  axios.post<ResponsesPagedResponseModelsRebaseRateQueue>('/admin/rebase_rate_queue/list', data);

/**
 * 更新 RebaseRateQueue
 */
export const updateRebaseRateQueueAPI = (data: any) =>
  axios.post<BaseResponse>('/admin/rebase_rate_queue/update', data);

/**
 * 获取合约任务列表
 * @param data 分页参数
 * @returns Promise 返回合约任务列表数据
 */
export const getContractTaskIndexAPI = (data: { page: number; page_size: number }) =>
  axios.post('/admin/contract_task/index', {
    ...data,
    // event: '',
    // event_id: 0,
    // id: 0,
    // method_name: '',
    // status: '',
    // tx_hash: '',
  });

/**
 * 重推合约任务
 * @param id 合约任务ID
 * @returns Promise 返回重推结果
 */
export const repushContractTaskAPI = (id: number) =>
  axios.post('/admin/contract_task/repush', {
    id,
  });

/**
 * 获取Rebase日志列表
 */
export const getRebaseLogIndexAPI = (data: any) => axios.post<any>('/admin/rebase_log/index', data);

/**
 * 获取DAO日志列表
 */
export const getDaoLogIndexAPI = (data: any) => axios.post<any>('/admin/dao/index', data);

/**
 * 获取DAO Reward Rate
 */
export const getDaoRewardRateAPI = () => axios.post<any>('/admin/config/get_dao_reward_rate');

/**
 * 设置DAO Reward Rate
 */
export const setDaoRewardRateAPI = (data: { rate: number }) =>
  axios.post<any>('/admin/config/set_dao_reward_rate', data);

//----------------------------------------------

/**
 * responses.Response-responses_PagedResponse-array_models_RebaseLog
 */
export interface Response {
  code?: number;
  data?: ResponsesPagedResponseArrayModelsRebaseLog;
  message?: string;
  [property: string]: any;
}

/**
 * responses.PagedResponse-array_models_RebaseLog
 */
export interface ResponsesPagedResponseArrayModelsRebaseLog {
  list?: ModelsRebaseLog[];
  total?: number;
  [property: string]: any;
}

/**
 * models.RebaseLog
 */
export interface ModelsRebaseLog {
  createdAt?: number;
  createdAtString?: string;
  endedAt?: number;
  endedAtString?: string;
  errorMemberRebaseCount?: number;
  /**
   * 手续费
   */
  fee_amount?: number;
  /**
   * 冻结的质押数量
   */
  frozen_stake_amount?: number;
  /**
   * 冻结的质押利息
   */
  frozen_stake_interest_amount?: number;
  /**
   * 冻结质押rebase利息
   */
  frozen_stake_rebase_interest_amount?: number;
  id?: number;
  /**
   * 利息
   */
  interest_amount?: number;
  /**
   * LP债券质押利息
   */
  lp_bond_interest_amount?: number;
  /**
   * LP债券质押rebase利息
   */
  lp_bond_rebase_interest_amount?: number;
  /**
   * LP债券质押数量
   */
  lp_bond_stake_amount?: number;
  rebaseRate?: number;
  /**
   * 质押数量
   */
  stake_amount?: number;
  /**
   * 质押利息
   */
  stake_interest_amount?: number;
  /**
   * 质押rebase利息
   */
  stake_rebase_interest_amount?: number;
  status?: number;
  statusString?: string;
  successMemberRebaseCount?: number;
  /**
   * Tcash到USDT的汇率
   */
  tcash_to_usdt?: number;
  totalMemberRebaseCount?: number;
  /**
   * 国库债券质押利息
   */
  treasury_bond_interest_amount?: number;
  /**
   * 国库债券质押rebase利息
   */
  treasury_bond_rebase_interest_amount?: number;
  /**
   * 国库债券质押数量
   */
  treasury_bond_stake_amount?: number;
  updatedAt?: number;
  updatedAtString?: string;
  [property: string]: any;
}

/**
 * 批量空投TCASH
 * /admin/nft/airdrop
 * 批量给指定会员空投TCASH。可以通过type指定会员类型,或直接提供accounts列表。单次空投金额不能超过2 TCASH
 */
export const airdropTcashAPI = (data: {
  accounts?: string[];
  amount?: number;
  /**
   * 类型 dividend_rewards guild_subsidies governance airdrop_rewards exclusive_events
   */
  type?:
    | 'dividend_rewards'
    | 'guild_subsidies'
    | 'governance'
    | 'airdrop_rewards'
    | 'exclusive_events';
}) => axios.post('/admin/nft/airdrop', data);

/**
 * nft空投记录
 * /admin/nft/airdrop_log
 * 分页查询空投记录列表
 * {
    "page": 1,
    "page_size": 10
  }
 */
export const airdropLogAPI = (data: { page: number; page_size: number }) =>
  axios.post<{
    list: Array<{
      amount: number;
      created_at: number;
      created_at_string: string;
      id: number;
      type: string;
      updated_at: number;
      updated_at_string: string;
    }>;
    total: number;
  }>('/admin/nft/airdrop_log', data);

 // 空投详情记录类型
export interface AirdropDetailRecord {
  id: number;
  address: string;
  amount_before: number;
  amount_after: number;
  amount_change: number;
  asset_type: string;
  created_at: string;
  event: string;
  event_id: number;
  event_table: string;
  hash: string;
  member_id: number;
  remarks: string;
  status: number;
}
// 空投详情请求参数
export interface GetAirdropDetailsParams {
  air_drop_log_id?: number | string;
  address?: string;
  asset_type?: string;
  page: number;
  page_size: number;
}

// 空投详情响应
export interface GetAirdropDetailsResponse {
  list: AirdropDetailRecord[];
  total: number;
}

// 获取空投详情API
export const getAirdropDetailsAPI = (params: GetAirdropDetailsParams) =>
  axios.post<GetAirdropDetailsResponse>('/admin/transaction_log/nft_reward_index', params);


// 创建债券请求参数接口
export interface CreateBondParams {
  name: string;
  contract_address?: string;
  new_contract_address?: string;
  discount: number;
  release_cycle: number;
  status: string;
  type: number;
  business_type: number;
}

// 创建债券API
export const createBondPurchaseAPI = (params: CreateBondParams) =>
  axios.post<BaseResponse>('/admin/bond/create', params);



// 获取所有配置
export const getAllConfigAPI = () => axios.post<any>('/admin/config/all_config');


// 设置债券合约使用类型 (1:新债券, 2:旧债券)
export const setBondContractUseAPI = (type: string) =>
  axios.post<BaseResponse>('/admin/config/bond_contract_use', {
    key: 'bond_contract_use',
    value: type
  });

// 设置自定义全网质押团队业绩
export const setAllTeamStakeAPI = (params: any) => axios.post<any>('/admin/config/all_team_stake', params);


// 设置社区奖励波比
export const setCommunityRewardRateAPI = (params: any) => axios.post<any>('/admin/config/community_reward_rate', params);

// 设置自定义全网新增质押团队业绩
export const setIncrAllTeamStakeAPI = (params: any) => axios.post<any>('/admin/config/incr_all_team_stake', params);


// 设置社区新增奖励波比
export const setIncrCommunityRewardRateAPI = (params: any) => axios.post<any>('/admin/config/incr_community_reward_rate', params);


// 设置默认rebase利率
export const setRebaseRateAPIForConfig = (params: any) => axios.post<any>('/admin/config/rebase_rate', params);


// 获取last_date_all_stake_amount
export const getLastDateAllStakeAmountAPI = (params: any) => axios.post<any>('/admin/community_reward_log/last_date_all_stake_amount', params);

// 根据key获取配置
export const getConfigByKeyAPI = (key: string) => axios.post<any>('/admin/config/get_config_by_key', { key });

export const updateConfig = (key: ApiPublicTypes.ConfigItemKey, value: string) => axios.post('/admin/config/update_config_by_key', { key, value })