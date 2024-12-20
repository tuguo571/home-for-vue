import type { BlogPost } from "../types/blog";
import { rssConfig } from "@/config/rss";

// 从 XML 元素获取文本内容
function getElementText(element: Element | null): string {
  if (!element) return "";
  const text = element.textContent || "";
  return text.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim();
}

// 获取博客文章列表
export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(rssConfig.url, {
      headers: {
        Accept: "application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, "text/xml");
    const items = doc.querySelectorAll("item");

    return Array.from(items).map((item): BlogPost => {
      const title = getElementText(item.querySelector("title"));
      const link = getElementText(item.querySelector("link"));
      const pubDate = getElementText(item.querySelector("pubDate"));
      const description = getElementText(item.querySelector("description"));
      const category = getElementText(item.querySelector("category"));
      const content =
        getElementText(item.querySelector("content\\:encoded")) || description;

      return {
        title,
        link,
        date: pubDate ? new Date(pubDate) : new Date(),
        description: content,
        category: category || "默认分类",
      };
    });
  } catch (error) {
    console.error("获取博客文章失败:", error);
    return [];
  }
}
