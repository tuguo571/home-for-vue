import type { BlogPost } from "@/types/blog";

// 使用 DOMParser 解析 XML
function parseXML(xmlText: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(xmlText, "text/xml");
}

// 从 XML 元素获取文本内容
function getElementText(element: Element | null): string {
  if (!element) return "";
  return (
    element.textContent?.replace(/<!\[CDATA\[(.*?)\]\]>/g, "$1").trim() || ""
  );
}

function extractImage(content: string): string {
  // 尝试从内容中匹配第一张图片
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  // 如果没有找到图片，返回默认图片
  return "/images/default-blog.jpg";
}

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch("/rss.xml", {
      method: "GET",
      headers: {
        Accept: "application/xml, text/xml, */*",
      },
    });

    if (!response.ok) {
      console.error("RSS 响应状态:", response.status);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlText = await response.text();
    console.log("RSS 原始内容:", xmlText.substring(0, 200));

    if (!xmlText || xmlText.trim() === "") {
      throw new Error("Empty response received");
    }

    const doc = parseXML(xmlText);
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
        image: extractImage(content), // 从内容中提取图片
      };
    });
  } catch (error) {
    console.error("获取博客文章失败:", error);
    if (error instanceof Error) {
      console.error("错误详情:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    return [];
  }
}
