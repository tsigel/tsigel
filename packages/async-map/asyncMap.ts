const map = <T, U>(
  treads: number,
  callback: (data: T, index: number) => U | Promise<U>,
  list: Array<T>
): Promise<Array<U>> => {
  const isPromise = (item: unknown): item is Promise<unknown> =>
    typeof item === "object" &&
    typeof (item as Promise<unknown>)?.then === "function";

  const local = list.slice().reverse();
  const result: Array<U> = [];
  let activeTreads = 0;

  return new Promise((resolve, reject) => {
    const loop = () => {
      const index = list.length - local.length;

      const addItem = (index: number) => (item: U) => {
        result[index] = item;
        activeTreads--;
        loop();
      };

      if (!local.length) {
        if (activeTreads === 0) {
          resolve(result);
        }
        return void 0;
      }

      const next = local.pop() as T;
      activeTreads++;

      try {
        const localResult = callback(next, index);

        if (isPromise(localResult)) {
          localResult.then(addItem(index)).catch(reject);
        } else {
          Promise.resolve(localResult).then(addItem(index)).catch(reject);
        }
      } catch (e) {
        reject(e);
        return void 0;
      }

      if (activeTreads < treads) {
        loop();
      }
    };

    loop();
  });
};

export function asyncMap<T, U>(treads: number, cb: Cb<T, U>): Curry1<T, U>;
export function asyncMap<T, U>(
  treads: number,
  cb: Cb<T, U>,
  list: T[]
): Promise<U[]>;
export function asyncMap<T, U>(
  treads: number,
  callback: Cb<T, U>,
  list?: Array<T>
): Promise<Array<U>> | Curry1<T, U> {
  if (!list) {
    return (list: Array<T>) => map(treads, callback, list);
  }
  return map(treads, callback, list);
}

type Curry1<T, U> = (list: Array<T>) => Promise<Array<U>>;
type Cb<T, U> = (data: T, index: number) => U | Promise<U>;

export default asyncMap;
