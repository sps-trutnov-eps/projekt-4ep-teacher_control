/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Základ URL backend API. Viz .env.example. */
  readonly VITE_API_BASE_URL?: string
  /** 'true' = aplikace jede proti MSW mockům místo backendu. */
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
