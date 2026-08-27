#!/usr/bin/env tsx

import { execSync } from "node:child_process"
import { randomBytes } from "node:crypto"
import fs from "node:fs"
import path, { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { NodeRuntime, NodeServices } from "@effect/platform-node"
import dotenv from "dotenv"
import { Console, Effect, Option } from "effect"
import { Command, Flag } from "effect/unstable/cli"
import packageJson from "../package.json" with { type: "json" }

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = path.resolve(process.cwd(), ".env")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const appendEnvValue = (key: string, value: string) => {
  let envContent = ""
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8")
  }
  if (envContent && !envContent.endsWith("\n")) {
    envContent += "\n"
  }
  envContent += `${key}="${value}"\n`
  fs.writeFileSync(envPath, envContent)
}

const main = Command.make(
  "solstatus",
  {
    cloudflareAccountId: Flag.string("cloudflare-account-id").pipe(
      Flag.optional,
      Flag.withDescription("Cloudflare Account ID"),
    ),
    cloudflareApiToken: Flag.string("cloudflare-api-token").pipe(
      Flag.optional,
      Flag.withDescription("Cloudflare API Token"),
    ),
    secretAlchemyPassphrase: Flag.string("secret-alchemy-passphrase").pipe(
      Flag.optional,
      Flag.withDescription("Alchemy Passphrase for state secrets"),
    ),
    betterAuthSecret: Flag.string("better-auth-secret").pipe(
      Flag.optional,
      Flag.withDescription("Better Auth Secret for authentication"),
    ),
    stage: Flag.string("stage").pipe(
      Flag.withDefault("dev"),
      Flag.withDescription("Deployment stage (default: dev)"),
    ),
    phase: Flag.choice("phase", ["destroy", "up", "read"]).pipe(
      Flag.withDefault("up" as const),
      Flag.withDescription("Phase to execute"),
    ),
    quiet: Flag.boolean("quiet").pipe(
      Flag.withDefault(false),
      Flag.withDescription("Run in quiet mode"),
    ),
    appName: Flag.string("app-name").pipe(
      Flag.withDefault("solstatus"),
      Flag.withDescription("Application name (default: solstatus)"),
    ),
    fqdn: Flag.string("fqdn").pipe(
      Flag.optional,
      Flag.withDescription(
        "Fully qualified domain name (optional - if not provided, a worker URL will be generated)",
      ),
    ),
  },
  (config) =>
    Effect.gen(function* () {
      const accountId =
        Option.getOrUndefined(config.cloudflareAccountId) ?? process.env.CLOUDFLARE_ACCOUNT_ID ?? ""
      const apiToken =
        Option.getOrUndefined(config.cloudflareApiToken) ?? process.env.CLOUDFLARE_API_TOKEN ?? ""

      if (!accountId || !apiToken) {
        yield* Console.error(
          "Error: CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN must be provided via CLI flags, .env file, or environment variables",
        )
        return yield* Effect.fail(1)
      }

      let secretAlchemyPassphrase =
        Option.getOrUndefined(config.secretAlchemyPassphrase) ??
        process.env.SECRET_ALCHEMY_PASSPHRASE ??
        ""

      if (!secretAlchemyPassphrase) {
        secretAlchemyPassphrase = randomBytes(16).toString("hex")
        yield* Console.log(
          "🔑 No --secret-alchemy-passphrase or env.SECRET_ALCHEMY_PASSPHRASE provided. Generating new passphrase...",
        )
        appendEnvValue("SECRET_ALCHEMY_PASSPHRASE", secretAlchemyPassphrase)
        yield* Console.log(`✅ Generated and saved new passphrase to ${envPath}`)
      }

      let betterAuthSecret =
        Option.getOrUndefined(config.betterAuthSecret) ?? process.env.BETTER_AUTH_SECRET ?? ""

      if (!betterAuthSecret) {
        betterAuthSecret = randomBytes(16).toString("hex")
        yield* Console.log(
          "🔑 No --better-auth-secret or env.BETTER_AUTH_SECRET provided. Generating new secret...",
        )
        appendEnvValue("BETTER_AUTH_SECRET", betterAuthSecret)
        yield* Console.log(`✅ Generated and saved new secret to ${envPath}`)
      }

      const fqdnValue = Option.getOrUndefined(config.fqdn) ?? ""
      const env = {
        ...process.env,
        CLOUDFLARE_ACCOUNT_ID: accountId,
        CLOUDFLARE_API_TOKEN: apiToken,
        ALCHEMY_STATE_TOKEN: apiToken,
        SECRET_ALCHEMY_PASSPHRASE: secretAlchemyPassphrase,
        BETTER_AUTH_SECRET: betterAuthSecret,
        APP_NAME: config.appName,
        ...(fqdnValue && { FQDN: fqdnValue }),
      }

      const args = [config.phase, config.stage]
      if (config.quiet) {
        args.push("--quiet")
      }

      const alchemyRunPath = path.join(__dirname, "../packages/infra/src/alchemy.run.ts")
      const command = `tsx ${alchemyRunPath} ${args.join(" ")}`

      try {
        execSync(command, {
          env,
          stdio: "inherit",
          cwd: __dirname,
        })
        yield* Console.log("\n✅ Command executed successfully")
      } catch (error) {
        yield* Console.error(`\n❌ Command failed: ${error}`)
        return yield* Effect.fail(1)
      }
    }),
).pipe(Command.withDescription("CLI wrapper for SolStatus infrastructure management"))

Command.run(main, {
  version: packageJson.version,
}).pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain)
