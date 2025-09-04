/**
 * responses.Response-responses_PagedResponse-array_models_BondPurchase
 */
export interface Response {
  code?: number;
  data?: ResponsesPagedResponseArrayModelsBondPurchase;
  message?: string;
  [property: string]: any;
}

/**
 * responses.PagedResponse-array_models_BondPurchase
 */
export interface ResponsesPagedResponseArrayModelsBondPurchase {
  list?: ModelsBondPurchase[];
  total?: number;
  [property: string]: any;
}

/**
 * models.BondPurchase
 */
export interface ModelsBondPurchase {
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
  [property: string]: any;
}

/**
 * 关联的债券
 *
 * models.Bond
 */
export interface Bond {
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
  [property: string]: any;
}
