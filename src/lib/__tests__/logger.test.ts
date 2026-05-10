import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { log } from "../logger";

describe("log", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("roteamento por nível", () => {
    it('level "info" → console.log', () => {
      log({ level: "info", action: "test" });
      expect(console.log).toHaveBeenCalledOnce();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('level "warn" → console.log', () => {
      log({ level: "warn", action: "test" });
      expect(console.log).toHaveBeenCalledOnce();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('level "error" → console.error', () => {
      log({ level: "error", action: "test" });
      expect(console.error).toHaveBeenCalledOnce();
      expect(console.log).not.toHaveBeenCalled();
    });
  });

  describe("formato JSON", () => {
    it("emite JSON válido", () => {
      log({ level: "info", action: "test" });
      const raw = (console.log as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string;
      expect(() => JSON.parse(raw)).not.toThrow();
    });

    it("preserva todos os campos passados", () => {
      log({ level: "info", action: "createPool", userId: "u-1", poolId: "p-1" });
      const raw = (console.log as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string;
      const parsed = JSON.parse(raw);
      expect(parsed.level).toBe("info");
      expect(parsed.action).toBe("createPool");
      expect(parsed.userId).toBe("u-1");
      expect(parsed.poolId).toBe("p-1");
    });

    it("inclui campo ts como ISO 8601", () => {
      log({ level: "info", action: "test" });
      const raw = (console.log as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string;
      const parsed = JSON.parse(raw);
      expect(parsed.ts).toBeDefined();
      expect(new Date(parsed.ts).toISOString()).toBe(parsed.ts);
    });

    it("não muta o objeto de entrada", () => {
      const entry = { level: "info" as const, action: "test" };
      const before = { ...entry };
      log(entry);
      expect(entry).toEqual(before);
    });
  });

  describe("campos extras", () => {
    it("suporta campos arbitrários sem erros", () => {
      expect(() =>
        log({ level: "error", action: "fail", error: "boom", meta: { x: 1 } })
      ).not.toThrow();
    });

    it("userId opcional pode ser omitido", () => {
      log({ level: "warn", action: "noUser" });
      const raw = (console.log as ReturnType<typeof vi.spyOn>).mock.calls[0][0] as string;
      const parsed = JSON.parse(raw);
      expect(parsed.userId).toBeUndefined();
    });
  });
});
