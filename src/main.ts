import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/styles/main.css";
import emailjs from "@emailjs/browser";

emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);

const app = createApp(App);
app.use(router);
app.mount("#app");
