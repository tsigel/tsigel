export type PromiseEntry<T> = T extends Promise<infer R> ? R : never;
export type ArrayEntry<T> = T extends Array<infer R> ? R : never;

export type Replace<T, Key extends keyof T, Target> = {
    [K in keyof T]: K extends Key ? Target : T[K];
};

export type Func<Args extends Array<any>, Return> = (...args: Args) => Return;

export type Optional<T, Key extends keyof T> = Omit<T, Key> &
    Partial<Pick<T, Key>>;

export type StrictType<T, Target> = T extends Target ? T : never;

export type ConvertSchema<T, Target> = Func<
    [T],
    {
        [Key in keyof T]: Key extends keyof Target ? Target[Key] : never;
    }
>;

export type WithTs<T> = T & { timestamp: number };

// For convenience
type Primitive = string | number | bigint | boolean | undefined | symbol;

export type PropertyStringPath<T, Prefix = ""> = {
    [K in keyof T]: K extends "valueOf" | "toString"
        ? never
        : T[K] extends Primitive | Array<any>
            ? `${string & Prefix}${string & K}`
            :
            | `${string & Prefix}${string & K}`
            | PropertyStringPath<
            Required<T[K]>,
            `${string & Prefix}${string & K}.`
        >;
}[keyof T];

type GetWithArray<O, K> = K extends []
    ? O
    : K extends [infer Key, ...infer Rest]
        ? Key extends keyof O
            ? GetWithArray<O[Key], Rest>
            : Key extends keyof NonNullable<O>
                ? GetWithArray<NonNullable<O>[Key], Rest> | void
                : never
        : never;

type Path<T> = T extends `${infer Key}.${infer Rest}`
    ? [Key, ...Path<Rest>]
    : T extends `${infer Key}`
        ? [Key]
        : [];

export type ValueByPath<
    T extends Record<string, any>,
    K extends string
> = GetWithArray<T, Path<K>>;
