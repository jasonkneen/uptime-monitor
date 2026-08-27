import { env } from "cloudflare:workers"
import type { SecondaryStorage } from "better-auth"

export const secondaryStorage: SecondaryStorage = {
  async get(key) {
    return await env.SESSIONS_KV.get(key)
  },
  async getAndDelete(key) {
    const value = await env.SESSIONS_KV.get(key)
    if (value !== null) {
      await env.SESSIONS_KV.delete(key)
    }
    return value
  },
  async increment(key, ttl) {
    const current = await env.SESSIONS_KV.get(key)
    const next = (current ? Number.parseInt(current, 10) : 0) + 1
    if (current === null) {
      await env.SESSIONS_KV.put(key, String(next), { expirationTtl: ttl })
    } else {
      await env.SESSIONS_KV.put(key, String(next))
    }
    return next
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
