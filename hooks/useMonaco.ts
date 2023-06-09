import { useState } from "preact/hooks";
import loader from "@monaco-editor/loader";

import useMount from "./useMount.ts";

function useMonaco() {
  const [monaco, setMonaco] = useState(loader.__getMonacoInstance());

  useMount(() => {
    let cancelable: ReturnType<typeof loader.init>;

    if (!monaco) {
      cancelable = loader.init();

      cancelable.then((monaco) => {
        setMonaco(monaco);
      });
    }

    return () => cancelable?.cancel();
  });

  return monaco;
}

export default useMonaco;
