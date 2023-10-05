import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { useMessages } from "hooks/useMessages.ts";
import { getDifference } from "utils/arrays.ts";

import Button from "islands/Button.tsx";
import Input from "islands/Input.tsx";
import Editor from "islands/Editor.tsx";
import ClientSelect from "islands/ClientSelect.tsx";
import ScriptDropdown, { scripts } from "islands/ScriptDropdown.tsx";

export default function REPL(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const [clientId, setClientId] = useState("");
  const [oldMessages, messages] = useMessages();

  const [code, setCode] = useState("");
  const [preset, setPreset] = useState<string>(scripts[0]);
  const [message, setMessage] = useState("");

  const [bundling, setBundling] = useState(false);
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);

  const [failedBundling, setFailedBundling] = useState(false);
  const [failedSending, setFailedSending] = useState(false);
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
    setBundling(false);
    setSending(false);
    setEvaluating(false);
    setFailedBundling(false);
    setFailedSending(false);
    setFailedEvaluating(false);
  }, [clientId]);

  useEffect(() => {
    bundledCodeRef.current = "";
  }, [code]);

  useEffect(() => {
    (async () => {
      if (!preset) return;
      try {
        const res = await fetch(`/scripts/${preset}.ts`);
        if (res.status !== 200) {
          setCode("");
          return;
        }

        const code = await res.text();
        setCode(code);
      } catch (e) {
        console.error(e);
        setCode("");
      }
    })();
  }, [preset]);

  useEffect(() => {
    const [_removedMessages, newMessages] = getDifference(
      oldMessages,
      messages,
      (a, b) => a.timestamp === b.timestamp && a.data === b.data,
    );

    for (const message of newMessages) {
      if (message.clientId !== clientId) continue;
      if (JSON.parse(message.data).type !== "error") continue;
      setFailedEvaluating(true);
      setEvaluating(false);
      return;
    }
  }, [messages]);

  const bundleCode = async (): Promise<boolean> => {
    setBundling(true);
    try {
      const res = await fetch("/api/bundle", {
        method: "POST",
        headers: { "x-client-id": clientId },
        body: code,
      });

      if (!res.ok) {
        setFailedBundling(true);
        setBundling(false);
        return false;
      }

      const bundledCode = await res.text();
      bundledCodeRef.current = bundledCode;
      setFailedBundling(false);
      setBundling(false);
      return true;
    } catch (e) {
      console.error(e);
      setFailedBundling(true);
      setBundling(false);
      return false;
    }
  };

  const evalCode = async (): Promise<boolean> => {
    try {
      setSending(true);
      setFailedEvaluating(false);
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
    } catch (e) {
      console.error(e);
      setFailedSending(true);
      setSending(false);
      return false;
    }
  };

  const postMessage = () =>
    fetch("/api/post", {
      method: "POST",
      headers: { "x-client-id": clientId },
      body: message,
    });

  return (
    <div {...props}>
      <div
        className={"flex flex-row items-start w-full h-full"}
      >
        <div className="w-1/2 h-full">
          <Editor
            value={code}
            onChange={(code) => setCode(code)}
            width="100%"
            height="100%"
          />
        </div>

        <div className="w-1/2 overflow-auto h-full">
          <table>
            <thead>
              <tr>
                <th class="w-1/6">Type</th>
                <th class="w-5/6">Data</th>
              </tr>
            </thead>
            <tbody>
              {messages.toReversed().filter((
                message,
              ) => message.clientId === clientId).map((message) => {
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
      </div>

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
          disabled={bundling || sending}
          onInput={(e) => setClientId(e.currentTarget.value)}
        />

        <ScriptDropdown
          style={{
            width: "12.5%",
          }}
          value={preset}
          disabled={bundling || sending}
          onInput={(e) => setPreset(e.currentTarget.value)}
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
    </div>
  );
}
