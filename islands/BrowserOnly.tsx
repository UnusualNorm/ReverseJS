import { ComponentChildren } from "preact";
import { IS_BROWSER } from "$fresh/runtime.ts";

const BrowserOnly = (
  { children, fallback }: {
    children?: ComponentChildren;
    fallback?: ComponentChildren;
  },
) => {
  return <>{IS_BROWSER ? children : fallback}</>;
};

export default BrowserOnly;
