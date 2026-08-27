import { describe, expect, it } from "vitest"
import { msToHumanReadable, secsToHumanReadable } from "../packages/common/src/utils/formatters"

describe("msToHumanReadable", () => {
  it("formats sub-second durations in milliseconds", () => {
    expect(msToHumanReadable(250, true)).toBe("250ms")
  })

  it("formats seconds with a short unit", () => {
    expect(msToHumanReadable(1500, true, 1)).toBe("1.5s")
  })
})

describe("secsToHumanReadable", () => {
  it("formats minutes", () => {
    expect(secsToHumanReadable(120, true)).toBe("2m")
  })

  it("formats hours", () => {
    expect(secsToHumanReadable(7200, true)).toBe("2h")
  })
})
