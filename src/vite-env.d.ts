/// <reference types="vite/client" />
declare module "*.mdx" {
  const Component: React.ComponentType<{
    components?: Record<string, unknown>;
  }>;
  export default Component;
}
