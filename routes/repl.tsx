import { useSignal } from "@preact/signals";

import REPL from "islands/REPL.tsx";

export default function REPLPage() {
  const messages = useSignal([]);
  return (
    <>
      <REPL messages={messages} />
    </>
  );
}
