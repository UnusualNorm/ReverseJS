import type { JSX } from "preact";

import Select from "islands/Select.tsx";

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
    <Select {...props}>
      {scripts.map((script) => (
        <option value={script}>
          {script}
        </option>
      ))}
    </Select>
  );
}
