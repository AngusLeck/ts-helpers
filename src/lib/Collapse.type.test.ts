import type { Collapse } from "../index.js";
import { assertEqual } from "./testHelpers/index.js";

it("exports Collapse from the package root", () => {
  type Collapsed = Collapse<{ id: string } & { count: number }>;
  type Expected = { id: string; count: number };

  assertEqual<Collapsed, Expected>(true);
});
