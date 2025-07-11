import { logError, logErrorStack } from "@solstatus/common/utils"

import { ReasonPhrases, StatusCodes } from "http-status-codes"
import { createZodRoute } from "next-zod-route"

export const createRoute = createZodRoute({
  handleServerError: (error: Error) => {
    const errorMessage = logError(error)
    logErrorStack(error)

    // TODO: Create custom error that takes message, error, and status code
    // if (error instanceof CustomError) {
    //   return new Response(JSON.stringify({ message: error.message }), { status: error.status });
    // }

    // Default error response
    return new Response(
      JSON.stringify({
        message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        error: errorMessage,
      }),
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    )
  },
})
