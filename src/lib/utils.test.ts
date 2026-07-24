import { cn, formatBytes, formatDate, truncate, sanitizeHTML, calculateCost } from "@/lib/utils";

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("text-red-500", "text-blue-500");
    expect(result).toBe("text-blue-500");
  });

  it("handles conditional classes", () => {
    const result = cn("base", false && "hidden", "extra");
    expect(result).toContain("base");
    expect(result).toContain("extra");
    expect(result).not.toContain("hidden");
  });
});

describe("formatBytes", () => {
  it("formats 0 bytes", () => {
    expect(formatBytes(0)).toBe("0 Bytes");
  });

  it("formats kilobytes", () => {
    expect(formatBytes(1024)).toBe("1 KB");
  });

  it("formats megabytes", () => {
    expect(formatBytes(1048576)).toBe("1 MB");
  });

  it("formats gigabytes", () => {
    expect(formatBytes(1073741824)).toBe("1 GB");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2024-01-15T10:30:00Z");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("formats a Date object", () => {
    const result = formatDate(new Date("2024-06-20T14:00:00Z"));
    expect(typeof result).toBe("string");
  });
});

describe("truncate", () => {
  it("returns full string if shorter than limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates long strings", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });

  it("returns exact string at limit", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });
});

describe("sanitizeHTML", () => {
  it("escapes HTML entities", () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"
    );
  });

  it("escapes ampersands", () => {
    expect(sanitizeHTML("a & b")).toBe("a &amp; b");
  });

  it("escapes quotes", () => {
    expect(sanitizeHTML('"hello"')).toBe("&quot;hello&quot;");
  });
});

describe("calculateCost", () => {
  it("calculates cost for tokens", () => {
    expect(calculateCost(1000000, 30)).toBe(30);
  });

  it("calculates cost for small token count", () => {
    expect(calculateCost(1000, 30)).toBe(0.03);
  });

  it("returns 0 for 0 tokens", () => {
    expect(calculateCost(0, 30)).toBe(0);
  });
});
