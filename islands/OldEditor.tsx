import { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { asset, IS_BROWSER } from "$fresh/runtime.ts";
import { Suspense } from "preact/compat";
import type { editor, languages } from "monaco-editor";

const DENO_VERSION = "1.33.1";
const TYPESCRIPT_VERSION = "5.0.3";

interface CSSOptions {
  options?: languages.css.Options;
  modeConfiguration?: languages.css.ModeConfiguration;
}

interface HTMLOptions {
  options?: languages.html.Options;
  modeConfiguration?: languages.html.ModeConfiguration;
}

interface JSONOptions {
  diagnosticsOptions?: languages.json.DiagnosticsOptions;
  modeConfiguration?: languages.json.ModeConfiguration;
}

interface TypescriptOptions {
  compilerOptions?: languages.typescript.CompilerOptions;
  diagnosticsOptions?: languages.typescript.DiagnosticsOptions;
  eagerModelSync?: boolean;
  extraLibs?: ({
    content: string;
    filePath?: string;
  } | {
    url: string;
    filePath?: string;
  })[];
  inlayHintsOptions?: languages.typescript.InlayHintsOptions;
  maximumWorkerIdleTime?: number;
  modeConfiguration?: languages.typescript.ModeConfiguration;
  workerOptions?: languages.typescript.WorkerOptions;
}

type Monaco = typeof import("monaco-editor");

interface EditorProps {
  divProps?: JSX.HTMLAttributes<HTMLDivElement>;
  options?: editor.IStandaloneEditorConstructionOptions;
  override?: editor.IEditorOverrideServices;
  languageDefaults?: {
    css?: CSSOptions;
    less?: CSSOptions;
    scss?: CSSOptions;
    html?: HTMLOptions;
    json?: JSONOptions;
    typescript?: TypescriptOptions;
    javascript?: TypescriptOptions;
  };
  onInit?: (monaco: Monaco) => Promise<void> | void;
}

const applyLanguageDefaults = async (
  monaco: Monaco,
  languageDefaults: EditorProps["languageDefaults"],
) => {
  if (!languageDefaults) return;
  const { css, less, scss, html, json, typescript, javascript } =
    languageDefaults;
  if (css) {
    if (css.options) {
      monaco.languages.css.cssDefaults.setOptions({
        ...monaco.languages.css.cssDefaults.options,
        ...css.options,
      });
    }

    if (css.modeConfiguration) {
      monaco.languages.css.cssDefaults.setModeConfiguration({
        ...monaco.languages.css.cssDefaults.modeConfiguration,
        ...css.modeConfiguration,
      });
    }
  }

  if (less) {
    if (less.options) {
      monaco.languages.css.lessDefaults.setOptions({
        ...monaco.languages.css.lessDefaults.options,
        ...less.options,
      });
    }

    if (less.modeConfiguration) {
      monaco.languages.css.lessDefaults.setModeConfiguration({
        ...monaco.languages.css.lessDefaults.modeConfiguration,
        ...less.modeConfiguration,
      });
    }
  }

  if (scss) {
    if (scss.options) {
      monaco.languages.css.scssDefaults.setOptions({
        ...monaco.languages.css.scssDefaults.options,
        ...scss.options,
      });
    }

    if (scss.modeConfiguration) {
      monaco.languages.css.scssDefaults.setModeConfiguration({
        ...monaco.languages.css.scssDefaults.modeConfiguration,
        ...scss.modeConfiguration,
      });
    }
  }

  if (html) {
    if (html.options) {
      monaco.languages.html.htmlDefaults.setOptions({
        ...monaco.languages.html.htmlDefaults.options,
        ...html.options,
      });
    }

    if (html.modeConfiguration) {
      monaco.languages.html.htmlDefaults.setModeConfiguration({
        ...monaco.languages.html.htmlDefaults.modeConfiguration,
        ...html.modeConfiguration,
      });
    }
  }

  if (json) {
    if (json.diagnosticsOptions) {
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        ...monaco.languages.json.jsonDefaults.diagnosticsOptions,
        ...json.diagnosticsOptions,
      });
    }

    if (json.modeConfiguration) {
      monaco.languages.json.jsonDefaults.setModeConfiguration({
        ...monaco.languages.json.jsonDefaults.modeConfiguration,
        ...json.modeConfiguration,
      });
    }
  }

  if (typescript) {
    if (typescript.compilerOptions) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        ...monaco.languages.typescript.typescriptDefaults
          .getCompilerOptions(),
        ...typescript.compilerOptions,
      });
    }

    if (typescript.diagnosticsOptions) {
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        ...monaco.languages.typescript.typescriptDefaults
          .getDiagnosticsOptions(),
        ...typescript.diagnosticsOptions,
      });
    }

    if (typescript.eagerModelSync != undefined) {
      monaco.languages.typescript.typescriptDefaults.setEagerModelSync(
        typescript.eagerModelSync,
      );
    }

    if (typescript.extraLibs) {
      const rawExtraLibs = monaco.languages.typescript.typescriptDefaults
        .getExtraLibs();

      const extraLibs = Object.keys(rawExtraLibs).map((path) => ({
        content: rawExtraLibs[path].content,
        filePath: path,
      }));

      const customExtraLibs = await Promise.all(
        typescript.extraLibs.map(async (lib) => {
          if ("content" in lib) return lib;

          const content = await fetch(lib.url, {
            redirect: "follow",
          }).then((response) => response.text());

          return {
            content,
            filePath: lib.filePath,
          };
        }),
      );

      monaco.languages.typescript.typescriptDefaults.setExtraLibs([
        ...extraLibs,
        ...customExtraLibs,
      ]);
    }

    if (typescript.inlayHintsOptions) {
      monaco.languages.typescript.typescriptDefaults.setInlayHintsOptions({
        ...monaco.languages.typescript.typescriptDefaults
          .inlayHintsOptions,
        ...typescript.inlayHintsOptions,
      });
    }

    if (typescript.maximumWorkerIdleTime) {
      monaco.languages.typescript.typescriptDefaults.setMaximumWorkerIdleTime(
        typescript.maximumWorkerIdleTime,
      );
    }

    if (typescript.modeConfiguration) {
      monaco.languages.typescript.typescriptDefaults.setModeConfiguration({
        ...monaco.languages.typescript.typescriptDefaults
          .modeConfiguration,
        ...typescript.modeConfiguration,
      });
    }

    if (typescript.workerOptions) {
      monaco.languages.typescript.typescriptDefaults.setWorkerOptions({
        ...monaco.languages.typescript.typescriptDefaults.workerOptions,
        ...typescript.workerOptions,
      });
    }
  }
};

const ActualEditor = (
  props: EditorProps,
) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editor = useRef<editor.IStandaloneCodeEditor>();

  useEffect(() => {
    if (editorRef.current) {
      (async () => {
        const monaco = await (await import(
          "@monaco-editor/loader"
        )).default.init();

        await applyLanguageDefaults(monaco, props.languageDefaults);
        console.log(props.onInit);
        await props.onInit?.(monaco);

        editor.current = monaco.editor.create(
          editorRef.current!,
          {
            value: "console.log('Hello world!');",
            language: "typescript",
          },
        );
      })();
    }

    return () => editor.current?.dispose();
  }, [editorRef]);

  return <div {...props.divProps} ref={editorRef} />;
};

export default function Editor(
  props: EditorProps,
) {
  const fallback = <div {...props.divProps}>loading...</div>;

  if (IS_BROWSER) {
    return <Suspense fallback children={<ActualEditor {...props} />} />;
  } else return fallback;
}
