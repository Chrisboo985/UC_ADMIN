/**
 * responses.Response-responses_PagedResponse-array_models_Stake
 */
export interface Response {
  code?: number;
  data?: ResponsesPagedResponseArrayModelsStake;
  message?: string;
  [property: string]: any;
}

/**
 * responses.PagedResponse-array_models_Stake
 */
export interface ResponsesPagedResponseArrayModelsStake {
  list?: ModelsStake[];
  total?: number;
  [property: string]: any;
}

/**
 * models.Stake
 */
export interface ModelsStake {
  /**
   * 累计利息
   */
  accrued_interest?: number;
  /**
   * 质押数量
   */
  amount?: number;
  /**
   * Created Time
   */
  created_at?: number;
  /**
   * 创建时间字符串
   */
  created_at_string?: string;
  /**
   * 交易hash
   */
  hash?: string;
  /**
   * 质押记录
   */
  id?: number;
  /**
   * 冻结状态
   */
  is_frozen?: boolean;
  /**
   * 会员地址
   */
  member_address?: string;
  /**
   * 会员id
   */
  member_id?: number;
  /**
   * Rebase 次数
   */
  rebase_count?: number;
  /**
   * 质押时间
   */
  tx_at?: number;
  /**
   * 质押时间字符串
   */
  tx_at_string?: string;
  /**
   * Updated Time
   */
  updated_at?: number;
  /**
   * 更新时间字符串
   */
  updated_at_string?: string;
  [property: string]: any;
}

/**
 * models.CommunityBonusRateConfig
 */
export interface ModelsCommunityBonusRateConfig {
  created_at?: number;
  created_at_string?: string;
  id?: number;
  /**
   * 大区业绩
   */
  large_performance?: number;
  /**
   * 等级
   */
  level?: number;
  /**
   * 分红比率
   */
  rate?: number;
  /**
   * 分红比率上限
   */
  max_rate?: number;
  /**
   * 小区业绩
   */
  small_performance?: number;
  /**
   * 个人质押数量
   */
  stake_amount?: number;
  /**
   * 等级名称
   */
  title?: string;
  /**
   * 1:极差分红;2:平级分红
   */
  type?: number;
  /**
   * 1:极差分红;2:平级分红
   */
  type_string?: string;
  updated_at?: number;
  updated_at_string?: string;
  [property: string]: any;
}