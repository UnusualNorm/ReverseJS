import type {
  ITerminalAddon,
  ITerminalOptions,
  Terminal as XTerm,
} from "xterm";
import { Head, IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useRef, useState } from "preact/hooks";
import { WebLinksAddon } from "https://esm.sh/xterm-addon-web-links@0.9.0";
import { FitAddon } from "https://esm.sh/xterm-addon-fit@0.8.0";
import { HTMLAttributes } from "preact/compat";

interface TerminalProps extends HTMLAttributes<HTMLDivElement> {
  options: ITerminalOptions;
  addons?: ITerminalAddon[];
  onTerminalBinary?(data: string): void;
  onTerminalCursorMove?(): void;
  onTerminalData?(data: string): void;
  onTerminalKey?(event: { key: string; domEvent: KeyboardEvent }): void;
  onTerminalLineFeed?(): void;
  onTerminalScroll?(newPosition: number): void;
  onTerminalSelectionChange?(): void;
  onTerminalRender?(event: { start: number; end: number }): void;
  onTerminalResize?(event: { cols: number; rows: number }): void;
  onTerminalTitleChange?(newTitle: string): void;
  customTerminalKeyEventHandler?(event: KeyboardEvent): boolean;
}

const Terminal = (props: TerminalProps) => {
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const terminalRef = useRef<XTerm>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!IS_BROWSER) return;
    if (loaded) return;

    // Should really only run once, but just in case
    if (loading) return;
    setLoading(true);

    (async () => {
      const { Terminal: XTerm } = await import("xterm");
      terminalRef.current = new XTerm(props.options);
      terminalRef.current.open(containerRef.current!);
      for (const addon of props.addons ?? []) {
        terminalRef.current.loadAddon(addon);
      }
    })().then(() => {
      setLoading(false);
      setLoaded(true);
    });
  }, [IS_BROWSER]);

  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://esm.sh/xterm@5.3.0/css/xterm.css"
        />
      </Head>
      <div {...props} ref={containerRef}>
      </div>
    </>
  );
};

export default Terminal;
