import { logError, logErrorStack } from "@solstatus/common/utils"
import { ReasonPhrases, StatusCodes } from "http-status-codes"
import type { z } from "zod"

type RouteContext = {
  params: any
  query: any
  body: any
}

type RouteHandler = (request: Request, context: RouteContext) => Promise<Response> | Response

function handleServerError(error: unknown) {
  const err = error instanceof Error ? error : new Error(String(error))
  const errorMessage = logError(err)
  logErrorStack(err)
  return new Response(
    JSON.stringify({
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: errorMessage,
    }),
    { status: StatusCodes.INTERNAL_SERVER_ERROR },
  )
}

function parseSearchParams(request: Request) {
  const url = new URL(request.url)
  const raw: Record<string, string> = {}
  for (const [key, value] of url.searchParams.entries()) {
    raw[key] = value
  }
  return raw
}

function makeHandler(options: {
  params?: z.ZodType<any>
  query?: z.ZodType<any>
  body?: z.ZodType<any>
  handler: RouteHandler
}) {
  return async (request: Request, routeContext: { params?: Record<string, string> } = {}) => {
    try {
      const params = options.params
        ? options.params.parse(routeContext.params ?? {})
        : (routeContext.params ?? {})
      const query = options.query ? options.query.parse(parseSearchParams(request)) : {}
      let body: unknown
      if (options.body && request.method !== "GET" && request.method !== "HEAD") {
        body = options.body.parse(await request.json())
      }
      return await options.handler(request, { params, query, body })
    } catch (error) {
      return handleServerError(error)
    }
  }
}

function finish(partial: {
  params?: z.ZodType<any>
  query?: z.ZodType<any>
  body?: z.ZodType<any>
}) {
  return {
    body(schema: z.ZodType<any>) {
      return {
        handler(handler: RouteHandler) {
          return makeHandler({ ...partial, body: schema, handler })
        },
      }
    },
    query(schema: z.ZodType<any>) {
      return {
        handler(handler: RouteHandler) {
          return makeHandler({ ...partial, query: schema, handler })
        },
        body(bodySchema: z.ZodType<any>) {
          return {
            handler(handler: RouteHandler) {
              return makeHandler({ ...partial, query: schema, body: bodySchema, handler })
            },
          }
        },
      }
    },
    handler(handler: RouteHandler) {
      return makeHandler({ ...partial, handler })
    },
  }
}

export const createRoute = {
  params(schema: z.ZodType<any>) {
    return finish({ params: schema })
  },
  query(schema: z.ZodType<any>) {
    return finish({ query: schema })
  },
  body(schema: z.ZodType<any>) {
    return finish({ body: schema })
  },
  handler(handler: RouteHandler) {
    return makeHandler({ handler })
  },
}
