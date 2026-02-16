/// <reference types="vite/client" />

/** Vite exposes only env vars prefixed with VITE_ to the client (no server secrets). */
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Base public path (e.g. '' or '/subpath'). Set via vite config base option. */
  readonly BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv & {
    readonly MODE: string
    readonly DEV: boolean
    readonly PROD: boolean
    readonly SSR: boolean
  }
}

/** Allow importing image assets so tsc and deploy build succeed. */
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
