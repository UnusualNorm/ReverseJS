import type { JSX } from "preact";
import type { editor } from "monaco-editor";
import type { ComponentChild, RefObject } from "preact";

export type Monaco = typeof import("monaco-editor");

export type Theme = "vs" | "vs-dark";

// Container

export type ContainerProps = {
  width: number | string;
  height: number | string;
  isEditorReady: boolean;
  loading: ComponentChild;
  _ref: RefObject<HTMLDivElement>;
  className?: string;
  wrapperProps?: JSX.HTMLAttributes<HTMLElement>;
};

// Editor

export type OnMount = (
  editor: editor.IStandaloneCodeEditor,
  monaco: Monaco,
) => void;

export type BeforeMount = (monaco: Monaco) => void;

export type OnChange = (
  value: string | undefined,
  ev: editor.IModelContentChangedEvent,
) => void;

export type OnValidate = (markers: editor.IMarker[]) => void;

export type EditorProps = {
  /**
   * Default value of the current model
   */
  defaultValue?: string;

  /**
   * Default language of the current model
   */
  defaultLanguage?: string;

  /**
   * Default path of the current model
   * Will be passed as the third argument to `.createModel` method
   * `monaco.editor.createModel(..., ..., monaco.Uri.parse(defaultPath))`
   */
  defaultPath?: string;

  /**
   * Value of the current model
   */
  value?: string;

  /**
   * Language of the current model
   */
  language?: string;

  /**
   * Path of the current model
   * Will be passed as the third argument to `.createModel` method
   * `monaco.editor.createModel(..., ..., monaco.Uri.parse(defaultPath))`
   */
  path?: string;

  /**
   * The theme for the monaco
   * Available options "vs-dark" | "light"
   * Define new themes by `monaco.editor.defineTheme`
   * @default "light"
   */
  theme?: Theme | string;

  /**
   * The line to jump on it
   */
  line?: number;

  /**
   * The loading screen before the editor will be mounted
   * @default "Loading..."
   */
  loading?: ComponentChild;

  /**
   * IStandaloneEditorConstructionOptions
   */
  options?: editor.IStandaloneEditorConstructionOptions;

  /**
   * IEditorOverrideServices
   */
  overrideServices?: editor.IEditorOverrideServices;

  /**
   * Indicator whether to save the models' view states between model changes or not
   * Defaults to true
   */
  saveViewState?: boolean;

  /**
   * Indicator whether to dispose the current model when the Editor is unmounted or not
   * @default false
   */
  keepCurrentModel?: boolean;

  /**
   * Width of the editor wrapper
   * @default "100%"
   */
  width?: number | string;

  /**
   * Height of the editor wrapper
   * @default "100%"
   */
  height?: number | string;

  /**
   * Class name for the editor container
   */
  className?: string;

  /**
   * Props applied to the wrapper element
   */
  wrapperProps?: JSX.HTMLAttributes<HTMLElement>;

  /**
   * Signature: function(monaco: Monaco) => void
   * An event is emitted before the editor is mounted
   * It gets the monaco instance as a first argument
   * Defaults to "noop"
   */
  beforeMount?: BeforeMount;

  /**
   * Signature: function(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void
   * An event is emitted when the editor is mounted
   * It gets the editor instance as a first argument and the monaco instance as a second
   * Defaults to "noop"
   */
  onMount?: OnMount;

  /**
   * Signature: function(value: string | undefined, ev: monaco.editor.IModelContentChangedEvent) => void
   * An event is emitted when the content of the current model is changed
   */
  onChange?: OnChange;

  /**
   * Signature: function(markers: monaco.editor.IMarker[]) => void
   * An event is emitted when the content of the current model is changed
   * and the current model markers are ready
   * Defaults to "noop"
   */
  onValidate?: OnValidate;
};

// DiffEditor

export type MonacoDiffEditor = editor.IStandaloneDiffEditor;

export type DiffOnMount = (editor: MonacoDiffEditor, monaco: Monaco) => void;

export type DiffBeforeMount = (monaco: Monaco) => void;

export type DiffEditorProps = {
  /**
   * The original source (left one) value
   */
  original?: string;

  /**
   * The modified source (right one) value
   */
  modified?: string;

  /**
   * Language for the both models - original and modified
   */
  language?: string;

  /**
   * This prop gives you the opportunity to specify the language of the
   * original source separately, otherwise, it will get the value of the language property
   */
  originalLanguage?: string;

  /**
   * This prop gives you the opportunity to specify the language of the
   * modified source separately, otherwise, it will get the value of language property
   */
  modifiedLanguage?: string;

  /**
   * Path for the "original" model
   * Will be passed as a third argument to `.createModel` method
   * `monaco.editor.createModel(..., ..., monaco.Uri.parse(originalModelPath))`
   */
  originalModelPath?: string;

  /**
   * Path for the "modified" model
   * Will be passed as a third argument to `.createModel` method
   * `monaco.editor.createModel(..., ..., monaco.Uri.parse(modifiedModelPath))`
   */
  modifiedModelPath?: string;

  /**
   * Indicator whether to dispose the current original model when the DiffEditor is unmounted or not
   * @default false
   */
  keepCurrentOriginalModel?: boolean;

  /**
   * Indicator whether to dispose the current modified model when the DiffEditor is unmounted or not
   * @default false
   */
  keepCurrentModifiedModel?: boolean;

  /**
   * The theme for the monaco
   * Available options "vs-dark" | "light"
   * Define new themes by `monaco.editor.defineTheme`
   * @default "light"
   */
  theme?: Theme | string;

  /**
   * The loading screen before the editor will be mounted
   * @default "loading..."
   */
  loading?: ComponentChild;

  /**
   * IDiffEditorConstructionOptions
   */
  options?: editor.IDiffEditorConstructionOptions;

  /**
   * Width of the editor wrapper
   * @default "100%"
   */
  width?: number | string;

  /**
   * Height of the editor wrapper
   * @default "100%"
   */
  height?: number | string;

  /**
   * Class name for the editor container
   */
  className?: string;

  /**
   * Props applied to the wrapper element
   */
  wrapperProps?: JSX.HTMLAttributes<HTMLElement>;

  /**
   * Signature: function(monaco: Monaco) => void
   * An event is emitted before the editor is mounted
   * It gets the monaco instance as a first argument
   * Defaults to "noop"
   */
  beforeMount?: DiffBeforeMount;

  /**
   * Signature: function(editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void
   * An event is emitted when the editor is mounted
   * It gets the editor instance as a first argument and the monaco instance as a second
   * Defaults to "noop"
   */
  onMount?: DiffOnMount;
};
