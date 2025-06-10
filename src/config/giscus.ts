/**
 * Giscus 评论系统配置
 */

import { getEnv } from '../utils/env';

export interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: 'pathname' | 'url' | 'title' | 'og:title' | 'specific' | 'number';
  strict?: '0' | '1';
  reactionsEnabled?: '0' | '1';
  emitMetadata?: '0' | '1';
  inputPosition?: 'top' | 'bottom';
  theme?: string;
  lang?: string;
  loading?: 'lazy' | 'eager';
}

// 默认配置 - 请在 .env 文件中配置实际的仓库信息
export const defaultGiscusConfig: GiscusConfig = {
  repo: '', // 请在环境变量中配置：VITE_GISCUS_REPO
  repoId: '', // 请在环境变量中配置：VITE_GISCUS_REPO_ID
  category: 'Announcements', // 默认分类
  categoryId: '', // 请在环境变量中配置：VITE_GISCUS_CATEGORY_ID
  mapping: 'pathname',
  strict: '0',
  reactionsEnabled: '1',
  emitMetadata: '0',
  inputPosition: 'bottom',
  theme: 'preferred_color_scheme',
  lang: 'zh-CN',
  loading: 'lazy',
};

/**
 * 获取 Giscus 配置
 */
export const getGiscusConfig = (): GiscusConfig => {
  return {
    repo: getEnv('VITE_GISCUS_REPO') || defaultGiscusConfig.repo,
    repoId: getEnv('VITE_GISCUS_REPO_ID') || defaultGiscusConfig.repoId,
    category: getEnv('VITE_GISCUS_CATEGORY') || defaultGiscusConfig.category,
    categoryId: getEnv('VITE_GISCUS_CATEGORY_ID') || defaultGiscusConfig.categoryId,
    mapping: (getEnv('VITE_GISCUS_MAPPING') as GiscusConfig['mapping']) || defaultGiscusConfig.mapping,
    strict: (getEnv('VITE_GISCUS_STRICT') as GiscusConfig['strict']) || defaultGiscusConfig.strict,
    reactionsEnabled: (getEnv('VITE_GISCUS_REACTIONS_ENABLED') as GiscusConfig['reactionsEnabled']) || defaultGiscusConfig.reactionsEnabled,
    emitMetadata: (getEnv('VITE_GISCUS_EMIT_METADATA') as GiscusConfig['emitMetadata']) || defaultGiscusConfig.emitMetadata,
    inputPosition: (getEnv('VITE_GISCUS_INPUT_POSITION') as GiscusConfig['inputPosition']) || defaultGiscusConfig.inputPosition,
    theme: getEnv('VITE_GISCUS_THEME') || defaultGiscusConfig.theme,
    lang: getEnv('VITE_GISCUS_LANG') || defaultGiscusConfig.lang,
    loading: (getEnv('VITE_GISCUS_LOADING') as GiscusConfig['loading']) || defaultGiscusConfig.loading,
  };
};

/**
 * 验证 Giscus 配置
 */
export const validateGiscusConfig = (config: GiscusConfig): boolean => {
  if (!config.repo || !config.repoId || !config.category || !config.categoryId) {
    console.error('Giscus 配置不完整：缺少必要的仓库信息');
    return false;
  }

  // 验证仓库格式 (username/repo)
  const repoPattern = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
  if (!repoPattern.test(config.repo)) {
    console.error('Giscus 配置错误：仓库格式不正确，应为 username/repo');
    return false;
  }

  return true;
};

/**
 * 获取当前主题模式对应的 Giscus 主题
 */
export const getGiscusTheme = (isDark: boolean): string => {
  const config = getGiscusConfig();

  if (config.theme === 'preferred_color_scheme') {
    return isDark ? 'dark' : 'light';
  }

  return config.theme || 'preferred_color_scheme';
};

/**
 * Giscus 脚本 URL
 */
export const GISCUS_SCRIPT_URL = 'https://giscus.app/client.js';
