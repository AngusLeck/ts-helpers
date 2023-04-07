import { ToString } from "./ToString";

export function keys<T extends Record<string | number, unknown>>(
  obj: T
): ToString<keyof T>[] {
  return Object.keys(obj) as ToString<keyof T>[];
}
