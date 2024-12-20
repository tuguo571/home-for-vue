import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import {
  config,
  generateSitemap,
  generateRobots,
  siteConfig,
} from "./src/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const siteUrl = env.VITE_SITE_URL || config.siteUrl;

  return {
    plugins: [
      vue(),
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html
            .replace(/<title>.*?<\/title>/, `<title>${config.siteName}</title>`)
            .replace(
              /content="__DESCRIPTION__"/g,
              `content="${config.siteDescription}"`,
            )
            .replace(
              /content="__KEYWORDS__"/g,
              `content="${config.siteKeywords}"`,
            )
            .replace(/content="__AUTHOR__"/g, `content="${config.author}"`)
            .replace(/content="__URL__"/g, `content="${siteUrl}"`)
            .replace(/content="__TITLE__"/g, `content="${config.siteName}"`)
            .replace(
              /content="__LOGO__"/g,
              `content="${siteConfig.images.ogImage}"`,
            )
            .replace(/content="__SITE_NAME__"/g, `content="${config.siteName}"`)
            .replace(/href="__URL__"/g, `href="${siteUrl}"`);
        },
      },
      {
        name: "generate-seo-files",
        buildStart() {
          this.emitFile({
            type: "asset",
            fileName: "sitemap.xml",
            source: generateSitemap(siteUrl),
          });
          this.emitFile({
            type: "asset",
            fileName: "robots.txt",
            source: generateRobots(siteUrl),
          });
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      proxy: {
        "/rss.xml": {
          target: "https://www.mmm.sd",
          changeOrigin: true,
          headers: {
            Accept: "application/xml, text/xml, */*",
            Referer: "https://www.mmm.sd",
          },
        },
      },
    },
  };
});
