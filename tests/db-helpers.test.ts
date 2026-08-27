import { describe, expect, it } from "vitest"
import { takeFirstOrNull, takeUniqueOrThrow } from "../packages/common/src/db/index"

describe("takeUniqueOrThrow", () => {
  it("returns the single value", () => {
    expect(takeUniqueOrThrow(["only"])).toBe("only")
  })

  it("throws when the list is empty", () => {
    expect(() => takeUniqueOrThrow([])).toThrow("No values found")
  })

  it("throws when the list is not unique", () => {
    expect(() => takeUniqueOrThrow(["a", "b"])).toThrow("Found non unique value")
  })
})

describe("takeFirstOrNull", () => {
  it("returns null for an empty list", () => {
    expect(takeFirstOrNull([])).toBeNull()
  })

  it("returns the single value", () => {
    expect(takeFirstOrNull([7])).toBe(7)
  })
})
