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
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
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
