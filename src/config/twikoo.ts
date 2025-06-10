/**
 * Twikoo 留言板配置
 */

import { getEnv } from '../utils/env';

export interface TwikooConfig {
  envId: string;
  cdnUrl: string;
  region?: string;
  path?: string;
  lang?: string;
}

// 默认配置
export const defaultTwikooConfig: TwikooConfig = {
  envId: 'https://twikoo.moinkhao.eu.org',
  cdnUrl: 'https://cdn.staticfile.org/twikoo/1.6.31/twikoo.all.min.js',
  region: 'ap-shanghai',
  lang: 'zh-CN',
};

/**
 * 获取 Twikoo 配置
 */
export const getTwikooConfig = (): TwikooConfig => {
  return {
    envId: getEnv('VITE_TWIKOO_ENV_ID') || defaultTwikooConfig.envId,
    cdnUrl: getEnv('VITE_TWIKOO_CDN_URL') || defaultTwikooConfig.cdnUrl,
    region: defaultTwikooConfig.region,
    lang: defaultTwikooConfig.lang,
    path: window.location.pathname,
  };
};

/**
 * 验证 Twikoo 配置
 */
export const validateTwikooConfig = (config: TwikooConfig): boolean => {
  if (!config.envId || !config.cdnUrl) {
    console.error('Twikoo 配置不完整：缺少 envId 或 cdnUrl');
    return false;
  }

  try {
    new URL(config.envId);
    new URL(config.cdnUrl);
    return true;
  } catch (error) {
    console.error('Twikoo 配置错误：URL 格式不正确', error);
    return false;
  }
};
