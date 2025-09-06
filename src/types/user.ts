import type { IDateValue, ISocialLink } from './common';
// ----------------------------------------------------------------------

export type IUserProfileCover = {
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
};

export type IUserProfile = {
  id: string;
  role: string;
  quote: string;
  email: string;
  school: string;
  country: string;
  company: string;
  totalFollowers: number;
  totalFollowing: number;
  socialLinks: ISocialLink;
};

export type IUserProfileFollower = {
  id: string;
  name: string;
  country: string;
  avatarUrl: string;
};

export type IUserProfileGallery = {
  id: string;
  title: string;
  imageUrl: string;
  postedAt: IDateValue;
};

export type IUserProfileFriend = {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
};

export type IUserProfilePost = {
  id: string;
  media: string;
  message: string;
  createdAt: IDateValue;
  personLikes: { name: string; avatarUrl: string }[];
  comments: {
    id: string;
    message: string;
    createdAt: IDateValue;
    author: { id: string; name: string; avatarUrl: string };
  }[];
};

export type IUserCard = {
  id: string;
  name: string;
  role: string;
  coverUrl: string;
  avatarUrl: string;
  totalPosts: number;
  totalFollowers: number;
  totalFollowing: number;
};

export type IUserItem = {
  id: string;
  name: string;
  city: string;
  role: string;
  email: string;
  state: string;
  status: string;
  address: string;
  country: string;
  zipCode: string;
  company: string;
  avatarUrl: string;
  phoneNumber: string;
  isVerified: boolean;
  remark?: string;
};

export type IUserTableFilters = {
  stock: string[];
  publish: string[];
};

export type IUserTableFiltersForList = {
  address?: string; // 账号地址
  created_at_end?: number; // 结束时间
  created_at_start?: number; // 开始时间
  h_username?: string; // 登录账号
  member_code?: string; // 用户编码
  is_business?: boolean; // 是否商家
  parent_code?: string; // 上级编码
  parent_id?: string; // 上级id
};

export type IUserItemforlist = {
  id: number;
  member_code?: string; // 用户编码
  username?: string; // 用户名
  h_account?: string; // 登录账号
  h_nickname?: string; // 登录昵称
  email?: string; // 邮箱
  address?: string; // 地址
  apd?: number; // apd代币
  apd_to_usdt_amount?: number; // APD价值USDT金额
  bp?: number; // 商家积分
  cp?: number; // 消费积分
  is_active?: string; // 是否激活
  status?: string; // 用户状态
  is_business?: boolean; // 是否商家
  large_team_power_total?: number; // 大团队累积算力
  level?: number; // 等级 p0-p5 D1-D10
  calc_level?: number; // 计算等级
  mc?: number; // 出局额度
  parent_address?: string; // 上级地址
  superior_username?: string; // 上级用户名
  power?: number; // 有效算力
  rp?: number; // 原注册积分
  small_team_power_total?: number; // 小团队累积算力
  star_level?: number; // 星级 s1-s10
  team_power_total?: number; // 团队累积算力
  total_power?: number; // 累积算力
  hp?: number; // hp积分
  tp?: number; // 交易积分
  up?: number; // 用户积分
  virtual_level?: number; // 虚拟等级 p0-p5 D1-D10
  wapd?: number; // wapd代币
  xapd?: number; // 私募积分
  xapd_to_usdt_amount?: number; // XAPD价值USDT金额
  type?: number; // 会员类型（保留用于筛选）
  remark?: string; // 备注（保留用于筛选）

  parent_member?: {
    address: string;
  }
};

// 社区债券购买记录响应类型
export type IBondPurchaseItem = {
  /**
   * 计算数量 ksp
   */
  calc_amount?: number;
  /**
   * 折扣价格
   */
  discount_price?: number;
  /**
   * 应得数量 ksp
   */
  expected_amount?: number;
  /**
   * 交易hash
   */
  hash?: string;
  /**
   * 发送地址
   */
  member_address?: string;
  /**
   * 原始价格
   */
  price?: number;
  /**
   * usdt数量
   */
  purchase_amount?: number;
  /**
   * 购买时间
   */
  purchase_at?: number;
  /**
   * 用于数据表格的唯一ID
   */
  id: string;
};

// 社区债券购买汇总响应类型
export type IBondPurchaseGatherItem = {
  id?: string; // 添加ID字段，用于前端唯一标识
  bond_gather: number | string; // 支持数字和字符串类型
  bond_purchase_map: {
    [key: string]: number;
  };
  member_address: string;
  remark: string;
  /**
   * 类型 -1 空行, 2 运营中心、3 社区
   */
  type: -1 | 2 | 3;
  is_divider?: boolean;
};

export type IUserAccount = {
  city: string;
  email: string;
  state: string;
  about: string;
  address: string;
  zipCode: string;
  isPublic: boolean;
  displayName: string;
  phoneNumber: string;
  country: string | null;
  photoURL: File | string | null;
  remark?: string;
};

export type IUserAccountBillingHistory = {
  id: string;
  price: number;
  invoiceNumber: string;
  createdAt: IDateValue;
};
