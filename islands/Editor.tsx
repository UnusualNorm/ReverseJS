import { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function Editor(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<any>(null);

  useEffect(() => {
    (async () => {
      if (IS_BROWSER)
        editor.current = (await import("monaco-editor")).editor.create(
          editorRef.current!,
          {
            value: "console.log('Hello world!');",
            language: "javascript",
          }
        );
    })();

    return () => editor.current?.dispose();
  }, []);

  useEffect(() => {
    if (editorRef.current && editor.current) editor.current.layout();
  }, [props.style]);

  return <div {...props} ref={editorRef} />;
}
