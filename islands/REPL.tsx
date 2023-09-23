import type { ClientMessage } from "../server.ts";
import type { Signal } from "@preact/signals";
import { useEffect, useRef, useState } from "preact/hooks";

import Button from "islands/Button.tsx";
import Input from "islands/Input.tsx";
import Editor from "islands/Editor.tsx";
import ClientDropdown from "islands/ClientDropdown.tsx";
import ScriptDropdown from "islands/ScriptDropdown.tsx";

interface REPLProps {
  messages: Signal<{
    type: string;
    data: unknown; // probably string
  }[]>;
  defaultClientId?: string;
}

export default function REPL(props: REPLProps) {
  const [clientId, setClientId] = useState(props.defaultClientId ?? "");
  const [code, setCode] = useState("onmessage = (e) => postMessage(e.data);");
  const [codeFile, setCodeFile] = useState("");
  const [message, setMessage] = useState("Hello World!");
  const [bundling, setBundling] = useState(false);
  const bundledCodeRef = useRef("");

  const bundleAndSend = async () => {
    if (!bundledCodeRef.current) {
      setBundling(true);
      const res = await fetch("/api/bundle", {
        method: "POST",
        headers: { "x-client-id": clientId },
        body: code,
      });
      const bundledCode = await res.text();
      bundledCodeRef.current = bundledCode;
      setBundling(false);
    }
    evalCode();
  };

  useEffect(() => {
    bundledCodeRef.current = "";
  }, [code]);

  useEffect(() => {
    setInterval(async () => {
      const res = await fetch("/api/messages");
      const messages: ClientMessage[] = await res.json();
      props.messages.value = [
        ...props.messages.value,
        ...messages.map((message) => JSON.parse(message.data)),
      ];
    }, 2000);
  }, []);

  useEffect(() => {
    (async () => {
      if (codeFile) {
        const res = await fetch(`/scripts/${codeFile}`);
        if (res.status !== 200) {
          alert(`Error: ${res.statusText}`);
          return;
        }

        const code = await res.text();
        setCode(code);
      }
    })();
  }, [codeFile]);

  const evalCode = () =>
    fetch("/api/eval", {
      method: "POST",
      headers: { "x-client-id": clientId },
      body: bundledCodeRef.current,
    });

  const postMessage = () =>
    fetch("/api/post", {
      method: "POST",
      headers: { "x-client-id": clientId },
      body: message,
    });

  return (
    <div>
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
        <ClientDropdown
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
          value={codeFile}
          onInput={(e) => setCodeFile(e.currentTarget.value)}
        />

        <Input
          style={{
            width: "50%",
          }}
          value={message}
          onInput={(e) => setMessage(e.currentTarget.value)}
        />

        <Button
          style={{
            width: "12.5%",
          }}
          onClick={() => postMessage()}
        >
          Post
        </Button>

        <Button
          style={{
            width: "12.5%",
          }}
          onClick={() => bundleAndSend()}
          disabled={bundling}
        >
          {bundling ? "Bundling..." : "Eval"}
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
          {props.messages.value.toReversed().map((message) => (
            <tr>
              {/* Alight to middle */}
              <td class={"text-center"}>{message.type}</td>
              <td class={"text-center"}>
                {typeof message.data !== "string"
                  ? JSON.stringify(message.data)
                  : message.data}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
