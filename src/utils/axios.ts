import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { CONFIG } from 'src/config-global';
// 暂时只用jwt
import { STORAGE_KEY } from 'src/auth/context/jwt/constant';

// 通用的 API 响应接口
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 创建一个自定义的 Axios 实例类型，包装返回的响应类型
interface CustomAxiosInstance extends AxiosInstance {
  get<T = any, R = ApiResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
  post<T = any, R = ApiResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R>;
  put<T = any, R = ApiResponse<T>>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<R>;
  delete<T = any, R = ApiResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R>;
}

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

// 这是 模板用来默认请求的 axios 实例，实际开发中，请根据项目需求进行修改。
export default axiosInstance;

// ----------------------------------------------------------------------
// 这是模板常用的请求
export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------
// 请求节点地址
export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    signIn: '/admin/admin/login',
    signUp: '/api/auth/sign-up',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};

// ----------------------------------------------------------------------
// 还是得封装我们自己常用的axios实例,

export function jwtDecode(token: string) {
  try {
    if (!token) return null;

    const parts = token.split('.');
    if (parts.length < 2) {
      throw new Error('Invalid token!');
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));

    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    throw error;
  }
}

export function isValidToken(accessToken: string) {
  if (!accessToken) {
    return false;
  }

  try {
    const decoded = jwtDecode(accessToken);

    if (!decoded || !('exp' in decoded)) {
      return false;
    }

    const currentTime = Date.now() / 1000;

    return decoded.exp > currentTime;
  } catch (error) {
    console.error('Error during token validation:', error);
    return false;
  }
}

// 创建一个 自定义  Axios 实例
const axiosInstanceForApi: CustomAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL ?? '', // 替换为你实际的 API 地址
  timeout: 20000, // 设置超时时间，例如 10 秒
  headers: {
    'Content-Type': 'application/json',
  },
}) as CustomAxiosInstance;

// 请求拦截器
axiosInstanceForApi.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem(STORAGE_KEY);

    // 可以在这里添加 token
    if (accessToken && isValidToken(accessToken)) {
      // config.headers.Authorization = `Bearer ${accessToken}`;
      config.headers.token = `${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
axiosInstanceForApi.interceptors.response.use(
  (response) =>
    // 对响应数据进行处理
    response.data,
  (error) => {
    // 处理响应错误，比如统一处理 401 未认证等
    if (error.response?.status === 401) {
      // 可以进行登出或者跳转到登录页面的操作
      console.error('Unauthorized, please log in.');
      // 跳转逻辑或者清除 token
    }

    return Promise.reject(error);
  }
);

export const axiosForApi = axiosInstanceForApi;

// ----------------------------------------------------------------------

// 定义  自定义fetcher 函数
export const fetcherForList = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];
  const response = await axiosForApi.post(url, { ...config });
  return response.data; // 返回数据
};
