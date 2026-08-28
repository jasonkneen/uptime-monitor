const DEV: AppEnvMetadata = {}

const PRE: AppEnvMetadata = {
  ...DEV,
}

const PROD: AppEnvMetadata = {
  ...PRE,
}

export enum AppEnvID {
  DEV = "dev",
  PRE = "pre",
  PROD = "prod",
}

// Empty until app-env metadata is used.
export interface AppEnvMetadata {}

const AppEnvs: { [value in AppEnvID]: AppEnvMetadata } = {
  [AppEnvID.DEV]: DEV,
  [AppEnvID.PRE]: PRE,
  [AppEnvID.PROD]: PROD,
}

export function getAppEnvID(): AppEnvID {
  console.log(`Getting app env ID for [${process.env.VITE_APP_ENV ?? process.env.STAGE}]`)
  return getAppEnvIDFromStr(process.env.VITE_APP_ENV || process.env.STAGE || "dev")
}

export function getAppEnvIDFromStr(appEnvStr: string): AppEnvID {
  switch (appEnvStr.toLowerCase()) {
    case "dev":
      return AppEnvID.DEV
    case "pre":
      return AppEnvID.PRE
    case "prod":
      return AppEnvID.PROD
    default:
      throw new Error(`Unknown environment: ${appEnvStr}`)
  }
}

export function getAppEnvMetadata(appEnvId = getAppEnvID()): AppEnvMetadata {
  return AppEnvs[appEnvId]
}
