import { describe, it, expect } from "vitest";

describe("Hobby Limits Configuration", () => {
  const HOBBY_LIMITS = {
    active_cpu_hours: { limit: 4, unit: "CPU-hrs" },
    provisioned_memory: { limit: 360, unit: "GB-hrs" },
    edge_requests: { limit: 1_000_000, unit: "requests" },
    function_invocations: { limit: 1_000_000, unit: "invocations" },
    fast_data_transfer: { limit: 100, unit: "GB" },
    isr_reads: { limit: 1_000_000, unit: "reads" },
    isr_writes: { limit: 200_000, unit: "writes" },
    build_execution_minutes: { limit: 6000, unit: "minutes" },
    project_count: { limit: 200, unit: "projects" },
  };

  it("has correct Hobby plan limits", () => {
    expect(HOBBY_LIMITS.active_cpu_hours.limit).toBe(4);
    expect(HOBBY_LIMITS.edge_requests.limit).toBe(1_000_000);
    expect(HOBBY_LIMITS.function_invocations.limit).toBe(1_000_000);
    expect(HOBBY_LIMITS.fast_data_transfer.limit).toBe(100);
    expect(HOBBY_LIMITS.isr_reads.limit).toBe(1_000_000);
    expect(HOBBY_LIMITS.isr_writes.limit).toBe(200_000);
    expect(HOBBY_LIMITS.build_execution_minutes.limit).toBe(6000);
    expect(HOBBY_LIMITS.project_count.limit).toBe(200);
  });

  it("all limits are positive numbers", () => {
    for (const [key, val] of Object.entries(HOBBY_LIMITS)) {
      expect(val.limit).toBeGreaterThan(0);
      expect(typeof val.unit).toBe("string");
    }
  });
});

describe("Encryption Module", () => {
  it("encrypts and decrypts text correctly", async () => {
    const { encrypt, decrypt } = await import("../src/lib/encryption");

    process.env.ENCRYPTION_KEY = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    const original = "my-secret-vercel-token-12345";
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);

    expect(encrypted).not.toBe(original);
    expect(decrypted).toBe(original);
  });
});
