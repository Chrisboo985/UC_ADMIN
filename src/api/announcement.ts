import { axiosForApi } from 'src/utils/axios';

const axios = axiosForApi;

// 公告内容类型
export interface ModelsNoticeContent {
  content?: string;
  id?: number;
  language?: string;
  notice_id?: number;
  title?: string;
  [property: string]: any;
}

/**
 * 公告数据类型
 */
export interface ModelsNotice {
  /**
   * 创建时间
   */
  created_at?: number;
  /**
   * 结束时间
   */
  end_at?: number;
  /**
   * 通知ID
   */
  id?: number;
  notice_contents?: ModelsNoticeContent[];
  /**
   * 通知推送次数
   */
  push_count?: number;
  /**
   * 开始时间
   */
  start_at?: number;
  /**
   * 状态
   */
  status?: number;
  /**
   * 通知类型
   */
  type?: number;
  /**
   * 更新时间
   */
  updated_at?: number;
  [property: string]: any;
}

/**
 * 分页响应类型
 */
export interface ResponsesPagedResponseArrayModelsNotice {
  list?: ModelsNotice[];
  total?: number;
  [property: string]: any;
}

/**
 * API响应类型
 */
export interface Response<T> {
  code?: number;
  data?: T;
  message?: string;
  [property: string]: any;
}

// 创建公告请求参数类型
export interface NoticeCreateRequest {
  /**
   * 结束时间
   */
  end_at: number;
  /**
   * 通知内容
   */
  notice_contents?: ModelsNoticeContent[];
  /**
   * 通知次数
   */
  push_count?: number;
  /**
   * 开始时间
   */
  start_at: number;
  /**
   * 状态 1 开启 2关闭
   */
  status?: number;
  /**
   * 类型 1 全局 2 待定
   */
  type?: number;
  [property: string]: any;
}

/**
 * 获取公告列表参数
 */
export interface NoticeListRequest {
  page: number;
  page_size: number;
}

/**
 * 更新公告请求
 */
export interface NoticeUpdateRequest {
  /**
   * 公告ID
   */
  id: number;
  /**
   * 公告内容
   */
  notice_contents?: ModelsNoticeContent[];
  /**
   * 开始时间
   */
  start_at: number;
  /**
   * 结束时间
   */
  end_at: number;
  /**
   * 状态 1 开启 2关闭
   */
  status?: number;
}

/**
 * 获取公告详情请求
 */
export interface NoticeDetailRequest {
  /**
   * 公告ID
   */
  id: number;
}

/**
 * 创建公告
 * @param data 创建公告的参数
 * @returns Promise<Response>
 */
export async function createNotice(data: NoticeCreateRequest): Promise<Response<any>> {
  return axios.post('/admin/notice/create', data);
}

/**
 * 获取公告列表
 * @param params 分页参数
 * @returns Promise<Response<ResponsesPagedResponseArrayModelsNotice>>
 */
export async function getNoticeList(params: NoticeListRequest): Promise<Response<ResponsesPagedResponseArrayModelsNotice>> {
  return axios.post('/admin/notice/index', params);
}

/**
 * 获取公告详情
 */
export const getNoticeDetail = async (data: NoticeDetailRequest) => 
  axios.post<Response<ModelsNotice>>('/admin/notice/detail', data);

/**
 * 更新公告
 */
export const updateNotice = async (data: NoticeUpdateRequest) => 
  axios.post<Response<any>>('/admin/notice/update', data);




/**
 * 社区债券购买日记录列表
 * {
  "issue": "2025-03-08",
  "member_address": "0xE6e4dA85284084965208e12C7D53757b041565a1",
  "page": 1,
  "page_size": 10
}
 */
export interface CommunityBondPurchaseDayListRequest {
  issue?: string;
  member_address?: string;
  order_direction?: 'asc' | 'desc';
  order_field?: string;
  page: number;
  page_size: number;
}
export const getCommunityBondPurchaseDayList = async (data: CommunityBondPurchaseDayListRequest) => 
  axios.post<Response<any>>('/admin/member/community_bond_purchase_day_index', data);
