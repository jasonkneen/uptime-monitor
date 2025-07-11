import { env } from "cloudflare:workers"
import type { SecondaryStorage } from "better-auth"

export const secondaryStorage: SecondaryStorage = {
  async get(key) {
    return await env.SESSIONS_KV.get(key)
  },
  async set(key, value, ttl) {
    if (ttl) {
      await env.SESSIONS_KV.put(key, value, { expirationTtl: ttl })
    } else {
      await env.SESSIONS_KV.put(key, value)
    }
  },
  async delete(key) {
    await env.SESSIONS_KV.delete(key)
  },
}
