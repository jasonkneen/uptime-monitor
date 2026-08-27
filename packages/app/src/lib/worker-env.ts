import { env } from "cloudflare:workers"

export function getWorkerEnv() {
  return { env }
}
