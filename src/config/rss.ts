interface RssConfig {
  url: string;
}

export const rssConfig: RssConfig = {
  url: import.meta.env.PROD
    ? "https://www.mmm.sd/rss.xml" // 替换为你的生产环境 RSS 地址
    : "/rss.xml", // 开发环境使用代理
};
