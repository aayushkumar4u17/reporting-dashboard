/// <reference types="vite/client" />

// Vue SFC module declarations
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// TypeScript module declarations for path aliases
declare module '@/*'

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_SCHEMA_PATH: string
  // Add other environment variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}