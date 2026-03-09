/// <reference types="vite/client" />
// This file tells TypeScript about Vite and env variables. No runtime code; only type declarations.

// Extend Vite's env type so import.meta.env.VITE_WS_BASE_URL etc. are typed (optional string).
interface ImportMetaEnv {
  readonly VITE_WS_BASE_URL?: string
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// declare module: treat 'sockjs-client' as a module so we can import it without TypeScript complaining.
declare module 'sockjs-client'
