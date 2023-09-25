import AceEditor, { type IAceEditorProps } from "react-ace";
import BrowserOnly from "islands/BrowserOnly.tsx";

const Editor = (props: IAceEditorProps) => {
  return (
    <BrowserOnly
      // @ts-expect-error - Weird react stuff
      children={() => <AceEditor {...props} />}
    />
  );
};

export default Editor;
