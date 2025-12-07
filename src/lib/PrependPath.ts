import { ToString } from "./ToString";

/** Prepend a path to a key */
export type PrependPath<Key, Path extends string = ""> = Path extends ""
  ? ToString<Key>
  : `${Path}.${ToString<Key>}`;
