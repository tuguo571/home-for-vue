export interface NoticeButton {
  text: string;
  type?: "primary" | "secondary" | "danger";
  action: "close" | "navigate" | "link" | "custom";
  to?: string;
  href?: string;
  showAfter?: number | null; // null 表示刷新后就显示
  handler?: () => void;
}

export interface NoticeConfig {
  id: string;
  title: string;
  content: string;
  width?: string;
  maskClosable?: boolean;
  showClose?: boolean;
  buttons: NoticeButton[];
  defaultShowAfter?: number | null;
}
