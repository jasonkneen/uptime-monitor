import type { InfraMetadata } from "@solstatus/common/utils/types"

export async function getInfraMetadata(): Promise<InfraMetadata> {
  const response = await fetch("/api/infra-metadata")
  if (!response.ok) {
    throw new Error("Failed to load infra metadata")
  }
  return (await response.json()) as InfraMetadata
}
