import emailjs from "@emailjs/browser";

interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

const config = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

// 初始化 EmailJS
emailjs.init(config.publicKey);

export const emailConfig: EmailConfig = {
  serviceId: config.serviceId,
  templateId: config.templateId,
  publicKey: config.publicKey,
};

if (
  !emailConfig.serviceId ||
  !emailConfig.templateId ||
  !emailConfig.publicKey
) {
  throw new Error("Missing required EmailJS configuration");
}
