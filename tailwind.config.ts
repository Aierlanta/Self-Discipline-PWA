import { type Config } from "tailwindcss";
import { addDynamicIconSelectors } from "@iconify/tailwind"; // 导入插件

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: 'class', // 添加 darkMode 配置
  plugins: [ // 添加 plugins 数组
    addDynamicIconSelectors(), // 使用插件，默认使用 lucide 图标集
  ],
} satisfies Config;
