const emptyKv = {
  async get() {
    return null
  },
  async put() {},
  async delete() {},
}

export const env = {
  DB: {},
  SESSIONS_KV: emptyKv,
  BETTER_AUTH_SECRET: "dev-mock-better-auth-secret",
  MONITOR_EXEC: {
    async executeCheck() {},
  },
  MONITOR_TRIGGER_RPC: {
    async init() {},
    async updateCheckInterval() {},
    async deleteDo() {},
    async pauseDo() {},
    async resumeDo() {},
  },
  MONITOR_EXEC_NAME: "solstatus-dev-monitor-exec",
  MONITOR_TRIGGER_NAME: "solstatus-dev-monitor-trigger",
  CLOUDFLARE_ACCOUNT_ID: "00000000000000000000000000000000",
  VITE_APP_VERSION: "2.1.0-dev",
}
