import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import * as Cloudflare from "alchemy/Cloudflare"
import * as State from "alchemy/State"
import * as Test from "alchemy/Test/Vitest"
import * as Effect from "effect/Effect"
import { expect } from "vitest"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const LOCAL_ACCOUNT_ID = "00000000000000000000000000000000"

Object.assign(process.env, {
  ALCHEMY_DEV: "1",
  CI: "1",
  CLOUDFLARE_ACCOUNT_ID: LOCAL_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN: "local-emulation-token",
  STAGE: "test",
})

const { test } = Test.make({
  dev: true,
  providers: Cloudflare.providers(),
  stage: "test",
  state: State.inMemoryState(),
})

test.provider(
  "monitor-exec answers locally on Alchemy 2 workerd without a production deploy",
  (stack) =>
    Effect.gen(function* () {
      const output = yield* stack.deploy(
        Effect.gen(function* () {
          const db = yield* Cloudflare.D1.Database("db", {
            name: "solstatus-workerd-test",
          })
          const worker = yield* Cloudflare.Worker("monitor-exec", {
            name: "solstatus-workerd-test-monitor-exec",
            main: resolve(__dirname, "../packages/api/src/monitor-exec.ts"),
            compatibility: {
              date: "2026-07-21",
              flags: ["nodejs_compat"],
            },
            env: {
              DB: db,
              OPSGENIE_API_KEY: "",
              APP_ENV: "test",
              MONITOR_EXEC_NAME: "solstatus-workerd-test-monitor-exec",
              MONITOR_TRIGGER_NAME: "solstatus-workerd-test-monitor-trigger",
              CLOUDFLARE_ACCOUNT_ID: LOCAL_ACCOUNT_ID,
            },
          })
          return { url: worker.url }
        }),
      )

      const response = yield* Effect.promise(() => fetch(String(output.url)))
      const text = yield* Effect.promise(() => response.text())
      expect(response.status).toBe(200)
      expect(text).toContain("MonitorExec")
    }),
  { timeout: 120_000 },
)
