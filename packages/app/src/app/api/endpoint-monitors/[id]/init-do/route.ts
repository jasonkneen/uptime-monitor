import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { InitPayload } from "@solstatus/api/monitor-trigger"
import { takeUniqueOrThrow, useDrizzle } from "@solstatus/common/db"
import { EndpointMonitorsTable } from "@solstatus/common/db/schema"
import { eq } from "drizzle-orm"
import { StatusCodes } from "http-status-codes"
import { NextResponse } from "next/server"
import { createRoute } from "@/lib/api-utils"
import { idStringParamsSchema } from "@/lib/route-schemas"

/**
 * POST /api/endpoint-monitors/[id]/init-do
 *
 * Initializes a new Monitor DO for a specific endpointMonitor.
 *
 * @params {string} id - Endpoint Monitor ID
 * @returns {Promise<NextResponse>} JSON response confirming the Monitor DO has been initialized
 */
export const POST = createRoute
  .params(idStringParamsSchema)
  .handler(async (_request, context) => {
    const { env } = getCloudflareContext()
    const db = useDrizzle(env.DB)
    const endpointMonitor = await db
      .select()
      .from(EndpointMonitorsTable)
      .where(eq(EndpointMonitorsTable.id, context.params.id))
      .then(takeUniqueOrThrow)

    await env.MONITOR_TRIGGER_RPC.init({
      monitorId: endpointMonitor.id,
      monitorType: "endpoint",
      checkInterval: endpointMonitor.checkInterval,
    } as InitPayload)

    return NextResponse.json(
      { message: "Initialized Monitor DO" },
      { status: StatusCodes.OK },
    )
  })
