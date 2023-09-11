import { IS_BROWSER } from "$fresh/runtime.ts";
import { ComponentProps } from "preact";

export interface BrowserOnlyProps extends ComponentProps<"div"> {
  children: () => JSX.Element;
  fallback?: JSX.Element;
}

export default function BrowserOnly(
  { children, fallback, ...divProps }: BrowserOnlyProps,
) {
  if (!IS_BROWSER) return fallback ?? <p>Loading...</p>;
  return <div {...divProps}>{children()}</div>;
}
