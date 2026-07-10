import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  redisCmd,
  RedisError,
  RevisionConflictError,
  writeVersionedJson,
} from "./_userStore.js";

const redisResponse = (payload, status = 200) => new Response(JSON.stringify(payload), {
  status,
  headers: { "Content-Type": "application/json" },
});

describe("checked Redis storage", () => {
  beforeEach(() => {
    process.env.KV_REST_API_URL = "https://redis.example.test";
    process.env.KV_REST_API_TOKEN = "test-token";
  });

  afterEach(() => {
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    vi.unstubAllGlobals();
  });

  it.each([
    [redisResponse({ error: "upstream failure" }, 500)],
    [redisResponse({ error: "logical failure" }, 200)],
    [redisResponse({ unexpected: true }, 200)],
  ])("rejects HTTP, logical, and malformed command responses", async (response) => {
    vi.stubGlobal("fetch", vi.fn(async () => response));
    await expect(redisCmd(["SET", "key", "value"])).rejects.toBeInstanceOf(RedisError);
  });

  it("builds one atomic compare-and-set and confirms its revision", async () => {
    let command;
    vi.stubGlobal("fetch", vi.fn(async (_url, options) => {
      command = JSON.parse(options.body);
      return redisResponse({ result: ["OK", command[7]] });
    }));

    const revision = await writeVersionedJson("user:u1:settings", { theme: "dark" }, {
      enforce: true,
      baseRevision: "prior-revision",
    });

    expect(command.slice(0, 4)).toEqual(["EVAL", expect.any(String), "1", "user:u1:settings"]);
    expect(command[4]).toBe("1");
    expect(command[5]).toBe("prior-revision");
    expect(JSON.parse(command[6])).toMatchObject({ theme: "dark", revision });
    expect(command[7]).toBe(revision);
  });

  it("turns a compare-and-set mismatch into a typed conflict", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => redisResponse({ result: ["CONFLICT", "newer-revision"] })));

    await expect(writeVersionedJson("user:u1:archive", { archive: [] }, {
      enforce: true,
      baseRevision: "older-revision",
    })).rejects.toMatchObject({
      name: RevisionConflictError.name,
      status: 409,
      currentRevision: "newer-revision",
    });
  });
});
