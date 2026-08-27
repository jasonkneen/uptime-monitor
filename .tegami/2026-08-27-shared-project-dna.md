---
packages:
  solstatus: major
  "@solstatus/common": major
  "@solstatus/api": major
  "@solstatus/app": major
  "@solstatus/infra": major
---

## Align the published toolchain with Shared Project DNA

Package consumers now get Nub 0.4.11, TypeScript 7.0.2, Effect 4.0.0-beta.107,
Drizzle ORM 1.0.0-rc.5, and Zod 4.4.3. The CLI uses `effect/unstable/cli`
instead of `@effect/cli`. `package.json` license fields match the AGPL-3.0
`LICENSE` file.

Install with `nub install`. The previous `pnpm` workspace and Biome
lint/format path are gone. Alchemy stays on 0.43 until a later IaC rewrite.
