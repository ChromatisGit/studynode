export type NestedRecord<Keys extends readonly PropertyKey[], Leaf> =
  Keys extends readonly [infer K extends PropertyKey, ...infer Rest extends PropertyKey[]]
    ? Record<K, NestedRecord<Rest, Leaf>>
    : Leaf;

export function ensurePath<
  Obj extends Record<PropertyKey, any>,
  const Keys extends readonly PropertyKey[]
>(
  obj: Obj,
  ...keys: Keys
): any {
  let cur: any = obj;
  for (const k of keys) {
    cur = cur[k] ?? (cur[k] = {});
  }
  return cur;
}