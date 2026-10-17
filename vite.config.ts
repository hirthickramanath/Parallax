import { remarkSafeContent } from "./src/lib/mdx-authoring";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkMath from "remark-math";
import remarkFrontmatter from "remark-frontmatter";
import rehypeKatex from "rehype-katex";
export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMath, remarkSafeContent],
      rehypePlugins: [rehypeKatex],
    }),
    react(),
  ],
});
