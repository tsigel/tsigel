export function get_env_prop(key: string): string | undefined;
export function get_env_prop<T extends (env_value: string | undefined) => any>(
  key: string,
  processor?: T
): ReturnType<T>;
export function get_env_prop<R, T extends (env_value: string | undefined) => R>(
  key: string,
  processor?: T
): any {
  try {
    const value: string | undefined = process.env[key];
    return processor ? processor(value) : value;
  } catch (e: any) {
    throw new Error(`Error get ${key} from env! ${e?.message || String(e)}`);
  }
}

export default get_env_prop;

export const strict = (value: string | undefined): string => {
  if (value == null) {
    throw new Error(`Env value can't be empty!`);
  }
  return value;
};

export const list =
  (separator?: string) =>
  <T extends string | undefined>(value: T): ReturnList<T> => {
    if (value === undefined) {
      return undefined as ReturnList<T>;
    }
    return value.split(separator || ",") as ReturnList<T>;
  };

type ReturnList<T extends string | undefined> = T extends undefined
  ? undefined
  : Array<string>;
