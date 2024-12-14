import { get_env_prop, strict } from "./index";

describe("Get required property tests", () => {
  let code: number | undefined = undefined;
  let message: string[] = [];

  const origin_exit = process.exit;
  const origin_error = console.error;

  const make_test_env = (
    name: string,
    value: string | undefined,
    cb: () => void
  ) => {
    if (typeof value === "undefined") {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
    try {
      cb();
      delete process.env[name];
    } catch (e) {
      delete process.env[name];
      throw e;
    }
  };

  afterEach(() => {
    (process as any).exit = origin_exit;
    console.error = origin_error;
  });

  describe("With exception", () => {
    it("Get strict property", () => {
      expect(() => get_env_prop("SOME_NAME", strict)).toThrow(
        `Error get SOME_NAME from env! Env value can't be empty!`
      );
    });
  });

  describe("Without exception", () => {
    it("Get required property", () => {
      make_test_env("SOME_NAME", "some_text", () => {
        const value = get_env_prop("SOME_NAME");
        expect(code).toBe(undefined);
        expect(value).toBe("some_text");
      });
    });

    it("Get required number property", () => {
      make_test_env("SOME_NAME", "1", () => {
        const value = get_env_prop("SOME_NAME", Number);
        expect(code).toBe(undefined);
        expect(value).toBe(1);
      });
    });

    it("Get required boolean property", () => {
      make_test_env("SOME_NAME", "0", () => {
        const value = get_env_prop("SOME_NAME", (v) => Boolean(Number(v)));
        expect(code).toBe(undefined);
        expect(value).toBe(false);
      });
    });
  });
});
