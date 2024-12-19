<script setup lang="ts">
import { ref } from "vue";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const formData = ref<FormData>({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const isSubmitting = ref(false);
const submitStatus = ref<"success" | "error" | null>(null);

const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const handleSubmit = async () => {
  // 重置状态
  submitStatus.value = null;

  // 表单验证
  if (!formData.value.name.trim()) {
    alert("请输入您的姓名");
    return;
  }
  if (!formData.value.email.trim() || !validateEmail(formData.value.email)) {
    alert("请输入有效的邮箱地址");
    return;
  }
  if (!formData.value.message.trim()) {
    alert("请输入留言内容");
    return;
  }

  try {
    isSubmitting.value = true;
    // 这里添加实际的表单提交逻辑
    await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟请求
    submitStatus.value = "success";
    // 清空表单
    formData.value = {
      name: "",
      email: "",
      subject: "",
      message: "",
    };
  } catch (error) {
    submitStatus.value = "error";
    console.error("提交失败:", error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-4xl font-bold text-center mb-8">联系我</h1>
      <p class="text-gray-600 dark:text-gray-300 text-center mb-12">
        有任何问题或建议？请随时与我联系。
      </p>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- 姓名 -->
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            姓名 <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 邮箱 -->
        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            邮箱 <span class="text-red-500">*</span>
          </label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 主题 -->
        <div>
          <label
            for="subject"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            主题
          </label>
          <input
            id="subject"
            v-model="formData.subject"
            type="text"
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
            :disabled="isSubmitting"
          />
        </div>

        <!-- 留言 -->
        <div>
          <label
            for="message"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            留言 <span class="text-red-500">*</span>
          </label>
          <textarea
            id="message"
            v-model="formData.message"
            rows="6"
            required
            class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
            :disabled="isSubmitting"
          ></textarea>
        </div>

        <!-- 提交按钮 -->
        <div class="flex justify-center">
          <button
            type="submit"
            class="btn-primary min-w-[120px]"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              提交中...
            </span>
            <span v-else>发送消息</span>
          </button>
        </div>

        <!-- 提交状态提示 -->
        <transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="submitStatus"
            class="text-center py-2 px-4 rounded-lg"
            :class="{
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100':
                submitStatus === 'success',
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100':
                submitStatus === 'error',
            }"
          >
            {{
              submitStatus === "success"
                ? "消息已发送，感谢您的反馈！"
                : "发送失败，请稍后重试。"
            }}
          </div>
        </transition>
      </form>
    </div>
  </div>
</template>
