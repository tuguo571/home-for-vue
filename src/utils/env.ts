/**
 * 环境变量工具函数
 * 提供类型安全的环境变量访问
 */

// 定义环境变量类型
interface ViteEnv {
  VITE_APP_TITLE: string;
  VITE_APP_DESCRIPTION: string;
  VITE_APP_KEYWORDS: string;
  VITE_APP_AUTHOR: string;
  VITE_APP_URL: string;
  VITE_APP_LOGO: string;
  VITE_APP_GITHUB: string;
  VITE_APP_TWITTER: string;
  VITE_APP_TWITTER_URL: string;
  VITE_APP_THEME_COLOR: string;
  VITE_SITE_URL: string;
  VITE_TWIKOO_ENV_ID: string;
  VITE_TWIKOO_CDN_URL: string;
  VITE_GUESTBOOK_URL: string;
  // Giscus 评论系统环境变量（可选）
  VITE_GISCUS_REPO?: string;
  VITE_GISCUS_REPO_ID?: string;
  VITE_GISCUS_CATEGORY?: string;
  VITE_GISCUS_CATEGORY_ID?: string;
  VITE_GISCUS_MAPPING?: string;
  VITE_GISCUS_STRICT?: string;
  VITE_GISCUS_REACTIONS_ENABLED?: string;
  VITE_GISCUS_EMIT_METADATA?: string;
  VITE_GISCUS_INPUT_POSITION?: string;
  VITE_GISCUS_THEME?: string;
  VITE_GISCUS_LANG?: string;
  VITE_GISCUS_LOADING?: string;
  DEV: boolean;
  PROD: boolean;
  MODE: string;
}

/**
 * 获取环境变量
 * @param key 环境变量键名
 * @returns 环境变量值
 */
export function getEnv<K extends keyof ViteEnv>(key: K): ViteEnv[K] {
  return (import.meta as any).env[key];
}

/**
 * 安全获取环境变量（处理可能未定义的情况）
 * @param key 环境变量键名
 * @returns 环境变量值或 undefined
 */
export function getEnvSafe(key: string): string | undefined {
  const value = (import.meta as any).env[key];
  return typeof value === 'string' ? value : undefined;
}

/**
 * 获取所有环境变量
 * @returns 环境变量对象
 */
export function getAllEnv(): ViteEnv {
  return (import.meta as any).env;
}

/**
 * 检查是否为开发环境
 */
export const isDev = (): boolean => getEnv('DEV');

/**
 * 检查是否为生产环境
 */
export const isProd = (): boolean => getEnv('PROD');

/**
 * 获取当前模式
 */
export const getMode = (): string => getEnv('MODE');
