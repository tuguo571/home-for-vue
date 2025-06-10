/// <reference types="vite/client" />

// 扩展 Vite 的环境变量类型
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_DESCRIPTION: string;
  readonly VITE_APP_KEYWORDS: string;
  readonly VITE_APP_AUTHOR: string;
  readonly VITE_APP_URL: string;
  readonly VITE_APP_LOGO: string;
  readonly VITE_APP_GITHUB: string;
  readonly VITE_APP_TWITTER: string;
  readonly VITE_APP_TWITTER_URL: string;
  readonly VITE_APP_THEME_COLOR: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_TWIKOO_ENV_ID: string;
  readonly VITE_TWIKOO_CDN_URL: string;
  readonly VITE_GUESTBOOK_URL: string;
  // Giscus 评论系统环境变量
  readonly VITE_GISCUS_REPO?: string;
  readonly VITE_GISCUS_REPO_ID?: string;
  readonly VITE_GISCUS_CATEGORY?: string;
  readonly VITE_GISCUS_CATEGORY_ID?: string;
  readonly VITE_GISCUS_MAPPING?: string;
  readonly VITE_GISCUS_STRICT?: string;
  readonly VITE_GISCUS_REACTIONS_ENABLED?: string;
  readonly VITE_GISCUS_EMIT_METADATA?: string;
  readonly VITE_GISCUS_INPUT_POSITION?: string;
  readonly VITE_GISCUS_THEME?: string;
  readonly VITE_GISCUS_LANG?: string;
  readonly VITE_GISCUS_LOADING?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

// 扩展 ImportMeta 接口以包含 Vite 的 glob 方法
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly glob: (
    pattern: string,
    options?: {
      as?: 'raw' | 'url' | 'worker' | 'worker-inline';
      eager?: boolean;
      import?: string;
    }
  ) => Record<string, () => Promise<any>>;
}

// Vue 组件类型声明
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}



// 第三方模块声明
declare module "vite" {
  import type { UserConfig, Plugin } from "vite";

  export interface ViteConfig extends UserConfig {
    plugins?: Plugin[];
  }

  export const defineConfig: <T extends ViteConfig>(config: T) => T;
}



declare module "@emailjs/browser" {
  const emailjs: any;
  export default emailjs;
}

declare module "vite-plugin-compression";
declare module "vite-plugin-image-optimizer";
