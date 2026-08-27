// Alchemy 2 writes local workerd / wrangler state under `.alchemy/local`
// via `alchemy dev alchemy.run.ts --stage dev`. The 0.43 WranglerJson +
// finalize() path is gone.

console.log(
  "Alchemy 2 does not emit standalone wrangler.jsonc from this script. Use `nub run --filter @solstatus/infra infra:dev`.",
)
