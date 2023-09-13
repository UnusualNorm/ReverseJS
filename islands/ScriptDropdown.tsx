import type { JSX } from "preact";
import type { ClientInfo } from "../server.ts";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";

export const scripts = [
  "echo",
  "install",
  "powershell",
  "rcpl",
  "repl",
] as const;

export default function ScriptDropdown(
  props: JSX.HTMLAttributes<HTMLSelectElement>,
) {
  return (
    <select
      {...props}
      type={"dropdown"}
      disabled={!IS_BROWSER || props.disabled}
      class={`px-3 py-2 bg-white rounded border(gray-500 2) disabled:(opacity-50 cursor-not-allowed) ${
        props.class ?? ""
      }`}
    >
      {scripts.map((script) => (
        <option value={`${script}.ts`}>
          {script}
        </option>
      ))}
    </select>
  );
}
