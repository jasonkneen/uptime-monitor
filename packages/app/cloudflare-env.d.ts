import type { AppEnv } from "./infra/types/env"

declare global {
  namespace Cloudflare {
    interface Env extends AppEnv {}
  }
}

export {}
