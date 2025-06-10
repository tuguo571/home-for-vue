/**
 * 文本选择相关的工具函数
 */

/**
 * 清理页面上的所有文本选择
 */
export function clearTextSelection(): void {
  try {
    // 清除页面上的所有文本选择
    if (window.getSelection) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    }
    
    // 清除 document.selection (IE 兼容)
    if ((document as any).selection) {
      (document as any).selection.empty();
    }
  } catch (error) {
    console.warn('清理文本选择时出错:', error);
  }
}

/**
 * 检查选择是否跨越了指定容器的边界
 * @param containerSelector 容器选择器
 * @returns 是否跨越边界
 */
export function isSelectionCrossingBoundary(containerSelector: string): boolean {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const container = document.querySelector(containerSelector);
    
    if (!container) {
      return false;
    }

    const containerRect = container.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();
    
    // 检查选择是否完全在容器内
    return (
      rangeRect.top < containerRect.top ||
      rangeRect.bottom > containerRect.bottom ||
      rangeRect.left < containerRect.left ||
      rangeRect.right > containerRect.right
    );
  } catch (error) {
    console.warn('检查选择边界时出错:', error);
    return false;
  }
}

/**
 * 检查选择是否在指定容器内
 * @param containerSelector 容器选择器
 * @returns 是否在容器内
 */
export function isSelectionInContainer(containerSelector: string): boolean {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const container = document.querySelector(containerSelector);
    
    if (!container) {
      return false;
    }

    // 检查选择的起始和结束节点是否都在容器内
    return (
      container.contains(range.startContainer) &&
      container.contains(range.endContainer)
    );
  } catch (error) {
    console.warn('检查选择容器时出错:', error);
    return false;
  }
}

/**
 * 安全地设置文本选择
 * @param element 要选择的元素
 * @param start 开始位置
 * @param end 结束位置
 */
export function safeSetSelection(element: HTMLElement, start: number = 0, end?: number): void {
  try {
    const selection = window.getSelection();
    if (!selection) return;

    const range = document.createRange();
    const textNode = element.firstChild;
    
    if (!textNode || textNode.nodeType !== Node.TEXT_NODE) {
      return;
    }

    const textLength = textNode.textContent?.length || 0;
    const endPos = end !== undefined ? Math.min(end, textLength) : textLength;
    const startPos = Math.min(start, endPos);

    range.setStart(textNode, startPos);
    range.setEnd(textNode, endPos);
    
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (error) {
    console.warn('设置文本选择时出错:', error);
  }
}

/**
 * 获取选中的文本内容
 * @returns 选中的文本
 */
export function getSelectedText(): string {
  try {
    const selection = window.getSelection();
    return selection ? selection.toString() : '';
  } catch (error) {
    console.warn('获取选中文本时出错:', error);
    return '';
  }
}

/**
 * 防抖的选择清理函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖函数
 */
export function debouncedClearSelection(delay: number = 100): () => void {
  let timeoutId: number | null = null;
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      clearTextSelection();
      timeoutId = null;
    }, delay);
  };
}

/**
 * 创建选择变化监听器
 * @param callback 回调函数
 * @param options 选项
 * @returns 清理函数
 */
export function createSelectionChangeListener(
  callback: (selection: Selection | null) => void,
  options: {
    debounce?: number;
    container?: string;
  } = {}
): () => void {
  const { debounce = 0, container } = options;
  let timeoutId: number | null = null;
  
  const handleSelectionChange = () => {
    if (debounce > 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = window.setTimeout(() => {
        const selection = window.getSelection();
        
        // 如果指定了容器，检查选择是否在容器内
        if (container && selection && selection.rangeCount > 0) {
          if (!isSelectionInContainer(container)) {
            return;
          }
        }
        
        callback(selection);
        timeoutId = null;
      }, debounce);
    } else {
      const selection = window.getSelection();
      
      // 如果指定了容器，检查选择是否在容器内
      if (container && selection && selection.rangeCount > 0) {
        if (!isSelectionInContainer(container)) {
          return;
        }
      }
      
      callback(selection);
    }
  };
  
  document.addEventListener('selectionchange', handleSelectionChange);
  
  // 返回清理函数
  return () => {
    document.removeEventListener('selectionchange', handleSelectionChange);
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}
