import { memo } from "preact/compat";
import Loading from "components/Loading.tsx";
import type { JSX } from "preact";
import type { ContainerProps } from "../types/monaco.ts";

const styles: Record<string, JSX.CSSProperties> = {
  wrapper: {
    display: "flex",
    position: "relative",
    textAlign: "initial",
  },
  fullWidth: {
    width: "100%",
  },
  hide: {
    display: "none",
  },
};

// ** forwardref render functions do not support proptypes or defaultprops **
// one of the reasons why we use a separate prop for passing ref instead of using forwardref

function MonacoContainer({
  width,
  height,
  isEditorReady,
  loading,
  _ref,
  className,
  wrapperProps,
}: ContainerProps) {
  return (
    <section style={{ ...styles.wrapper, width, height }} {...wrapperProps}>
      {!isEditorReady && <Loading>{loading}</Loading>}
      <div
        ref={_ref}
        style={{ ...styles.fullWidth, ...(!isEditorReady && styles.hide) }}
        className={className}
      />
    </section>
  );
}

export default memo(MonacoContainer);
