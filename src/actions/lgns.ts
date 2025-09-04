import useSWR from 'swr';
import { useMemo } from 'react';
import { fetcherForList } from 'src/utils/axios';

// 定义 API 响应接口
interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// 定义 LGNS 数据接口
interface LgnsData {
  title: string;
  total: string;
  subTotal: string;
  color: string;
}

// SWR 配置
const swrOptions = {
  dedupingInterval: 2000,
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  refreshInterval: 30 * 60 * 1000,
};

// 获取 LGNS 数据的自定义 Hook
export function useGetLgnsData() {
  const url = '/api/lgns/data';

  const { data, isLoading, error, isValidating } = useSWR<ApiResponse<LgnsData[]>>(
    url,
    fetcherForList,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      lgnsData: data?.data || [],
      lgnsLoading: isLoading,
      lgnsError: error,
      lgnsValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
