import {
  type EffectCallback,
  type Inputs,
  useEffect,
  useRef,
} from "preact/hooks";

function useUpdate(
  effect: EffectCallback,
  inputs: Inputs,
  applyChanges = true,
) {
  const isInitialMount = useRef(true);

  useEffect(
    isInitialMount.current || !applyChanges
      ? () => {
        isInitialMount.current = false;
      }
      : effect,
    inputs,
  );
}

export default useUpdate;
