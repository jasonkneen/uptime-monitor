---
packages:
  solstatus: patch
  "@solstatus/common": patch
  "@solstatus/api": patch
  "@solstatus/app": patch
  "@solstatus/infra": patch
---

## Refresh non-breaking dependency pins

Published packages now pin Zod 4.5.4. The dashboard also pins
react-day-picker 9.14.0 and the React 19.2 type packages. Install with
`nub install`. The toolchain stays on Nub 0.4.11, Node 24.15.0, and
TypeScript 7.0.2.
