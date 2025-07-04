"use client"

import type {
  endpointMonitorsSelectSchema,
  uptimeChecksSelectSchema,
} from "@solstatus/common/db"
import { msToHumanReadable, secsToHumanReadable } from "@solstatus/common/utils"
import {
  IconAlertTriangle,
  IconLoader2,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconRosetteDiscountCheckFilled,
  IconTrash,
} from "@tabler/icons-react"
import { formatDistance } from "date-fns"
import type * as React from "react"
import { useEffect, useState } from "react"
import type { z } from "zod"
import { useIsMobile } from "@/registry/new-york-v4/hooks/use-mobile"
import { Badge } from "@/registry/new-york-v4/ui/badge"
import { Button } from "@/registry/new-york-v4/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/new-york-v4/ui/drawer"
import { Separator } from "@/registry/new-york-v4/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/new-york-v4/ui/tooltip"
import {
  handleDeleteWebsite,
  handlePauseMonitoring,
  handleResumeMonitoring,
} from "./endpoint-monitor-actions"

interface WebsiteDetailDrawerProps {
  endpointMonitor: z.infer<typeof endpointMonitorsSelectSchema>
  trigger?: React.ReactNode
}

export function EndpointMonitorDetailDrawer({
  endpointMonitor,
  trigger,
}: WebsiteDetailDrawerProps) {
  const isMobile = useIsMobile()
  const createdAt = new Date(endpointMonitor.createdAt)
  const updatedAt = new Date(endpointMonitor.updatedAt)

  const [latestUptimeCheck, setLatestUptimeCheck] = useState<z.infer<
    typeof uptimeChecksSelectSchema
  > | null>(null)
  const [isLoadingCheck, setIsLoadingCheck] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLatestCheck = async () => {
      if (!endpointMonitor.id) {
        return
      }
      setIsLoadingCheck(true)
      setCheckError(null)
      try {
        const response = await fetch(
          `/api/endpoint-monitors/${endpointMonitor.id}/uptime`,
        )
        if (!response.ok) {
          if (response.status === 404) {
            setLatestUptimeCheck(null) // No check found yet
          } else {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
        } else {
          const data = await response.json()
          setLatestUptimeCheck(data as z.infer<typeof uptimeChecksSelectSchema>)
        }
      } catch (error) {
        console.error("Failed to fetch latest uptime check:", error)
        setCheckError("Failed to load latest check.")
      } finally {
        setIsLoadingCheck(false)
      }
    }

    fetchLatestCheck()
  }, [endpointMonitor.id])

  const defaultTrigger = (
    <Button
      variant="link"
      className="text-foreground w-fit px-0 text-left"
      title={endpointMonitor.name}
    >
      {endpointMonitor.name.length > 32
        ? `${endpointMonitor.name.substring(0, 32)}...`
        : endpointMonitor.name}
    </Button>
  )

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>{trigger || defaultTrigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{endpointMonitor.name}</DrawerTitle>
          <DrawerDescription>
            Monitor details and configuration
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          <div className="grid gap-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">Id</span>
              <span>{endpointMonitor.id}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-medium">URL</span>
              <a
                href={endpointMonitor.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {endpointMonitor.url}
              </a>
            </div>

            <Separator />

            {/* Metadata Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-medium">Status</span>
                {endpointMonitor.isRunning ? (
                  <Badge
                    variant="secondary"
                    className="w-fit !bg-green-400 dark:!bg-green-700"
                  >
                    Running
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="w-fit">
                    Paused
                  </Badge>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Check Interval</span>
                <span>
                  {secsToHumanReadable(endpointMonitor.checkInterval)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-medium">Alert Status</span>
                <Badge
                  variant={
                    endpointMonitor.activeAlert ? "destructive" : "outline"
                  }
                  className="w-fit"
                >
                  {endpointMonitor.activeAlert ? "Alert Active" : "No Alert"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium">Consecutive Failures</span>
                <div className="flex items-center gap-1">
                  {endpointMonitor.consecutiveFailures > 0 && (
                    <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                  <span>{endpointMonitor.consecutiveFailures}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                <span className="font-medium">Expected Status Code</span>
                <span>
                  {endpointMonitor.expectedStatusCode ? (
                    <Badge variant="secondary">
                      {endpointMonitor.expectedStatusCode}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">2xx/3xx</Badge>
                  )}
                </span>
              </div>
            </div>

            <Separator />

            {/* Latest Check Section */}
            <div className="flex flex-col gap-1">
              <span className="font-medium">Latest Check</span>
              {isLoadingCheck ? (
                <IconLoader2 className="animate-spin h-4 w-4" />
              ) : checkError ? (
                <span className="text-red-500 text-xs">{checkError}</span>
              ) : latestUptimeCheck ? (
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {/* Status Item */}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-xs">Status</span>
                    <div className="flex items-center gap-1">
                      <Badge
                        variant={
                          latestUptimeCheck.isExpectedStatus
                            ? "outline"
                            : "destructive"
                        }
                        className="w-fit text-xs px-1.5 py-0.5"
                      >
                        {latestUptimeCheck.isExpectedStatus ? (
                          <IconRosetteDiscountCheckFilled className="h-3 w-3 mr-1" />
                        ) : (
                          <IconAlertTriangle className="h-3 w-3 mr-1 text-red-500" />
                        )}
                        {latestUptimeCheck.isExpectedStatus ? "OK" : "Down"}
                      </Badge>
                    </div>
                  </div>

                  {/* Status Code Item */}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-xs">
                      HTTP Status Code
                    </span>
                    <div className="text-sm">
                      {latestUptimeCheck.status === null ? (
                        <span className="text-gray-500">N/A</span>
                      ) : endpointMonitor.expectedStatusCode ? (
                        latestUptimeCheck.status ===
                        endpointMonitor.expectedStatusCode ? (
                          <span className="text-green-500">
                            {latestUptimeCheck.status}
                          </span>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="text-red-500 underline decoration-dashed cursor-help">
                                  {latestUptimeCheck.status}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Expected: {endpointMonitor.expectedStatusCode}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      ) : (
                        <>
                          {" "}
                          {/* Fallback to original range-based coloring */}
                          {latestUptimeCheck.status <= 299 && (
                            <span className="text-green-500">
                              {latestUptimeCheck.status}
                            </span>
                          )}
                          {latestUptimeCheck.status >= 300 &&
                            latestUptimeCheck.status <= 399 && (
                              <span className="text-yellow-500">
                                3xx Redirect: {latestUptimeCheck.status}
                              </span>
                            )}
                          {latestUptimeCheck.status >= 400 &&
                            latestUptimeCheck.status <= 499 && (
                              <span className="text-orange-500">
                                4xx Error: {latestUptimeCheck.status}
                              </span>
                            )}
                          {latestUptimeCheck.status >= 500 &&
                            latestUptimeCheck.status <= 599 && (
                              <span className="text-red-500">
                                5xx Error: {latestUptimeCheck.status}
                              </span>
                            )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Timestamp Item */}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-xs">Checked At</span>
                    <span className="flex items-center gap-1 text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="underline decoration-dashed cursor-help">
                              {formatDistance(
                                new Date(latestUptimeCheck.timestamp),
                                new Date(),
                                { addSuffix: true },
                              )}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {new Date(
                                latestUptimeCheck.timestamp,
                              ).toLocaleString(undefined, {
                                year: "numeric",
                                month: "numeric",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                                second: "numeric",
                                timeZoneName: "short",
                              })}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </span>
                  </div>

                  {/* Response Time Item */}
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-xs">Response Time</span>
                    <span className="text-xs">
                      {msToHumanReadable(
                        latestUptimeCheck.responseTime ?? 0,
                        true,
                      )}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-xs">No check data available.</span>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-medium text-muted-foreground">
                  Created
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline decoration-dashed cursor-help text-muted-foreground">
                        {formatDistance(createdAt, new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {createdAt.toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          timeZoneName: "short",
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-medium text-muted-foreground">
                  Last Updated
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline decoration-dashed cursor-help text-muted-foreground">
                        {formatDistance(updatedAt, new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {updatedAt.toLocaleString(undefined, {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          timeZoneName: "short",
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Separator />
          </div>
        </div>
        <DrawerFooter className="flex-col gap-4">
          <Button variant="primary" asChild>
            <a href={`/endpoint-monitors/${endpointMonitor.id}`}>
              View Detailed Analytics
            </a>
          </Button>

          <div className="flex gap-3 justify-stretch w-full">
            <Button
              className="flex-1"
              variant="secondary"
              size="icon"
              onClick={() => handleResumeMonitoring(endpointMonitor.id)}
            >
              <IconPlayerPlayFilled />
              <span className="sr-only">Delete endpoint monitor</span>
            </Button>

            {endpointMonitor.isRunning && (
              <Button
                className="flex-1"
                variant="secondary"
                size="icon"
                onClick={() => handlePauseMonitoring(endpointMonitor.id)}
              >
                <IconPlayerPauseFilled />
                <span className="sr-only">Delete endpoint monitor</span>
              </Button>
            )}

            <Button
              className="flex-1"
              variant="destructive"
              size="icon"
              onClick={() => handleDeleteWebsite(endpointMonitor.id)}
            >
              <IconTrash />
              <span className="sr-only">Delete endpoint monitor</span>
            </Button>
          </div>

          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
