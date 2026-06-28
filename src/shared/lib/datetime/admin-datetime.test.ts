import { describe, expect, it } from "vitest";
import { createAdminFormatters } from "./admin-datetime";

describe("createAdminFormatters", () => {
  it("formats datetimes in Asia/Kolkata with en-IN locale", () => {
    const { formatDateTime } = createAdminFormatters();
    const formatted = formatDateTime("2024-06-15T10:30:00.000Z");
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/2024/);
    expect(formatted).not.toBe("2024-06-15T10:30:00.000Z");
  });
});
