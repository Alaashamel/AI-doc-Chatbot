import {
  chatRequestSchema,
  registerSchema,
  loginSchema,
  createFolderSchema,
  userSettingsSchema,
} from "@/lib/validations";

describe("chatRequestSchema", () => {
  it("validates a valid chat request", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello, how are you?",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty message", () => {
    const result = chatRequestSchema.safeParse({
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional fields", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      conversationId: "550e8400-e29b-41d4-a716-446655440000",
      provider: "openai",
      model: "gpt-4o",
      temperature: 0.7,
      maxTokens: 4096,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid provider", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      provider: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects temperature out of range", () => {
    const result = chatRequestSchema.safeParse({
      message: "Hello",
      temperature: 3,
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("validates a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("validates a valid login", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createFolderSchema", () => {
  it("validates a valid folder name", () => {
    const result = createFolderSchema.safeParse({
      name: "My Folder",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createFolderSchema.safeParse({
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects long name", () => {
    const result = createFolderSchema.safeParse({
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

describe("userSettingsSchema", () => {
  it("validates partial settings", () => {
    const result = userSettingsSchema.safeParse({
      temperature: 0.5,
    });
    expect(result.success).toBe(true);
  });

  it("validates full settings", () => {
    const result = userSettingsSchema.safeParse({
      defaultProvider: "anthropic",
      defaultModel: "claude-sonnet-4-20250514",
      temperature: 0.7,
      maxTokens: 8192,
      theme: "dark",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid theme", () => {
    const result = userSettingsSchema.safeParse({
      theme: "purple",
    });
    expect(result.success).toBe(false);
  });
});
