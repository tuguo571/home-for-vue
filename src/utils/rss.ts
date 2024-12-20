import type { BlogPost } from "../types/blog";

// 从内容中提取图片
function extractImage(content: string): string | undefined {
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  return imgMatch?.[1];
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/rss.xml", {
      headers: {
        Accept: "application/xml, text/xml, */*",
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
      const title = item.querySelector("title")?.textContent?.trim() || "";
      const link = item.querySelector("link")?.textContent?.trim() || "";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim();
      const description =
        item.querySelector("description")?.textContent?.trim() || "";
      const category = item.querySelector("category")?.textContent?.trim();
      const content =
        item.querySelector("content\\:encoded")?.textContent?.trim() ||
        description;

      return {
        title,
        link,
        date: pubDate ? new Date(pubDate) : new Date(),
        description: content,
        category,
        image: extractImage(content),
      };
    });
  } catch (error) {
    console.error("获取博客文章失败:", error);
    return [];
  }
}
