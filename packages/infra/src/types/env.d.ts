import type { AppEnv } from "../../../app/infra/types/env"
import type { MonitorExecEnv, MonitorTriggerEnv } from "../../../api/infra/types/env"

export type { AppEnv, MonitorExecEnv, MonitorTriggerEnv }

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends MonitorExecEnv, MonitorTriggerEnv, AppEnv {}
  }
}
