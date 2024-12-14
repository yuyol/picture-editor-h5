import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
// 引入 Element Plus
import ElementPlus from 'element-plus';
// 引入 Element Plus 样式
import 'element-plus/dist/index.css';

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')