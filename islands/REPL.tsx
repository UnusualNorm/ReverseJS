import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useMessages } from "hooks/useMessages.ts";

import Button from "islands/Button.tsx";
import Input from "islands/Input.tsx";
import Editor from "islands/Editor.tsx";
import ClientSelect from "islands/ClientSelect.tsx";
import ScriptDropdown, { scripts } from "islands/ScriptDropdown.tsx";

export default function REPL(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [clientId, setClientId] = useState("");
  const messages = useMessages();

  const [code, setCode] = useState("");
  const [preset, setPreset] = useState<(typeof scripts)[number]>(scripts[0]);
  const [message, setMessage] = useState("");

  const [bundling, setBundling] = useState(false);
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [failedBundling, setFailedBundling] = useState(false);
  const [failedSending, setFailedSending] = useState(false);
  // TODO: Scan for errors and set failedEvaluating accordingly
  const [failedEvaluating, setFailedEvaluating] = useState(false);

  const bundledCodeRef = useRef("");

  const bundleAndSend = async () => {
    if (!bundledCodeRef.current || failedBundling) {
      const bundled = await bundleCode();
      if (!bundled) return;
    }

    const sent = await evalCode();
    if (!sent) return;
  };

  useEffect(() => {
    bundledCodeRef.current = "";
  }, [code]);

  useEffect(() => {
    (async () => {
      if (preset) {
        const res = await fetch(`/scripts/${preset}.ts`);
        if (res.status !== 200) {
          alert(`Error: ${res.statusText}`);
          return;
        }

        const code = await res.text();
        setCode(code);
      }
    })();
  }, [preset]);

  const bundleCode = async (): Promise<boolean> => {
    setBundling(true);
    const res = await fetch("/api/bundle", {
      method: "POST",
      headers: { "x-client-id": clientId },
      body: code,
    });

    if (!res.ok) {
      setFailedBundling(true);
      return false;
    }

    const bundledCode = await res.text();
    bundledCodeRef.current = bundledCode;
    setBundling(false);
    return true;
  };

  const evalCode = async (): Promise<boolean> => {
    setSending(true);
    const res = await fetch("/api/eval", {
      method: "POST",
      headers: { "x-client-id": clientId },
      body: bundledCodeRef.current,
    });

    if (!res.ok) {
      setFailedSending(true);
      return false;
    }

    setSending(false);
    setEvaluating(true);
    return true;
  };

  const postMessage = () =>
    fetch("/api/post", {
      method: "POST",
      headers: { "x-client-id": clientId },
      body: message,
    });

  return (
    <div {...props}>
      <Editor
        width="100%"
        value={code}
        onChange={(code) => setCode(code)}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <ClientSelect
          style={{
            width: "12.5%",
          }}
          value={clientId}
          onInput={(e) => setClientId(e.currentTarget.value)}
        />

        <ScriptDropdown
          style={{
            width: "12.5%",
          }}
          value={preset}
          onInput={(e) => setPreset(e.currentTarget.value as any)}
        />

        <Input
          style={{
            width: "50%",
          }}
          value={message}
          disabled={!clientId || !evaluating || failedEvaluating || sending ||
            failedSending || bundling || failedBundling}
          onInput={(e) => setMessage(e.currentTarget.value)}
        />

        <Button
          style={{
            width: "12.5%",
          }}
          disabled={!clientId || !evaluating || failedEvaluating || sending ||
            failedSending || bundling || failedBundling}
          onClick={() => postMessage()}
        >
          Post
        </Button>

        <Button
          style={{
            width: "12.5%",
          }}
          onClick={() => bundleAndSend()}
          disabled={!clientId || bundling || sending}
        >
          {sending
            ? "Sending..."
            : bundling
            ? "Bundling..."
            : (failedBundling || failedSending)
            ? "Failed..."
            : "Eval"}
        </Button>
      </div>

      <table class="w-full">
        <thead>
          <tr>
            <th class="w-1/6">Type</th>
            <th class="w-5/6">Data</th>
          </tr>
        </thead>
        <tbody>
          {messages.toReversed().map((message) => {
            const data = JSON.parse(message.data);
            return (
              <tr>
                <td class="text-center">{data.type}</td>
                <td class="text-center">
                  {typeof data.data !== "string"
                    ? JSON.stringify(data.data)
                    : data.data}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
