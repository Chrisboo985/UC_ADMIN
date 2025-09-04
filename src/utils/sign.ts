import { ethers } from 'ethers';

export const waitCondition = (condition: () => boolean, interval = 100): Promise<void> =>
  new Promise((resolve) => {
    const check = () => {
      if (condition()) {
        resolve();
      } else {
        setTimeout(check, interval);
      }
    };
    check();
  });
// 初始化 provider
let provider: ethers.BrowserProvider | ethers.JsonRpcProvider | undefined;

if (typeof window !== 'undefined' && (window as any).ethereum) {
  provider = new ethers.BrowserProvider((window as any).ethereum);
} else {
  provider = new ethers.JsonRpcProvider(import.meta.env.VITE_RPC_URL);
  console.warn('未安装 MetaMask!');
}

// 缓存相关配置
interface CacheItem {
  value: string;
  timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
const CACHE_KEY = 'SIGN_CACHE';

// 缓存工具
const cacheUtils = {
  getCache(): Map<string, CacheItem> {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? new Map(JSON.parse(cached)) : new Map();
  },

  setCache(cache: Map<string, CacheItem>) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache.entries())));
  },

  get(key: string): CacheItem | undefined {
    const cache = this.getCache();
    return cache.get(key);
  },

  set(key: string, value: string) {
    const cache = this.getCache();
    cache.set(key, { value, timestamp: Date.now() });
    this.setCache(cache);
  },

  delete(key: string) {
    const cache = this.getCache();
    cache.delete(key);
    this.setCache(cache);
  },
};

// 签名状态控制
let signing = false;

/**
 * 签名方法
 * @param address 要签名的地址
 * @returns {Promise<{hex_message: string, signed_string: string}>}
 */
export async function sign(address: string): Promise<SignResult> {
  if (signing) {
    await waitCondition(() => !signing);
  }
  signing = true;

  try {
    const now = Date.now();
    const oldAddress = cacheUtils.get('address')?.value;

    // 地址变更时清除缓存
    if (oldAddress && oldAddress !== address) {
      cacheUtils.delete('hex_message');
      cacheUtils.delete('signed_string');
    }
    cacheUtils.set('address', address);

    const hexMessageCache = cacheUtils.get('hex_message');
    const signedStringCache = cacheUtils.get('signed_string');

    // 如果缓存有效，直接返回缓存的签名
    if (
      hexMessageCache &&
      signedStringCache &&
      now - hexMessageCache.timestamp < CACHE_DURATION &&
      now - signedStringCache.timestamp < CACHE_DURATION
    ) {
      signing = false;
      return {
        hex_message: hexMessageCache.value,
        signed_string: `${signedStringCache.value}#T${now}`,
      };
    }

    // 生成新的签名
    const randomString = Math.random().toString(36).substring(2);
    const hex_message = ethers.hexlify(ethers.toUtf8Bytes(randomString));

    const signer = await provider?.getSigner();
    const signed_string = await signer?.signMessage(hex_message);

    if (!signed_string) {
      throw new Error('签名失败');
    }

    // 缓存新的签名
    cacheUtils.set('hex_message', hex_message);
    cacheUtils.set('signed_string', signed_string);

    signing = false;
    return {
      hex_message,
      signed_string: `${signed_string}#T${now}`,
    };
  } catch (error) {
    signing = false;
    throw error;
  }
}

export type SignResult = {
  hex_message: string;
  signed_string: string;
};
