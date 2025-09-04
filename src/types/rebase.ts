/**
 * responses.Response-responses_PagedResponse-models_RebaseRateQueue
 */
export interface Response {
  code?: number;
  data?: ResponsesPagedResponseModelsRebaseRateQueue;
  message?: string;
  [property: string]: any;
}

/**
 * responses.PagedResponse-models_RebaseRateQueue
 */
export interface ResponsesPagedResponseModelsRebaseRateQueue {
  list?: ModelsRebaseRateQueue;
  total?: number;
  [property: string]: any;
}

/**
 * models.RebaseRateQueue
 */
export interface ModelsRebaseRateQueue {
  /**
   * 创建时间
   */
  created_at?: number;
  /**
   * 创建时间字符串
   */
  created_at_string?: string;
  id?: number;
  /**
   * Rebase 率
   */
  rate?: number;
  /**
   * 关联的 RebaseLog ID
   */
  rebase_log_id?: number;
  /**
   * 状态：1-待处理，2-已处理
   */
  status?: number;
  /**
   * 状态字符串
   */
  status_string?: string;
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
