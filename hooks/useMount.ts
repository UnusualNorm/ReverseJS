import { type EffectCallback, useEffect } from "preact/hooks";

function useMount(effect: EffectCallback) {
  useEffect(effect, []);
}

export default useMount;
