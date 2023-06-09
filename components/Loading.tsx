import type { ComponentChild, JSX } from "preact";

const styles: Record<string, JSX.CSSProperties> = {
  container: {
    display: "flex",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
};

function Loading({ children }: {
  children?: ComponentChild;
}) {
  return <div style={styles.container}>{children}</div>;
}

export default Loading;
