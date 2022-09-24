/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Not nullish and not primitive
 */
export type Obj = {
  [key in any]: any;
};
