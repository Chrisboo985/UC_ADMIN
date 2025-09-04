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
  list: ModelsRebaseLog[];
  total: number;
  page: number;
  page_size: number;
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
