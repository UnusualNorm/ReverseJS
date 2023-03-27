import * as Comlink from "https://deno.land/x/comlink@4.3.1/mod.ts";

const scrubOutput = async (out: any): Promise<any> => {
  if (typeof out === "function") return null;
  if (typeof out === "object") {
    if (out instanceof Error) return out.message;
    if (out instanceof Promise) return await scrubOutput(await out);
    if (out instanceof Array) return Promise.all(out.map(scrubOutput));
    if (out instanceof Object) {
      const obj: any = {};
      for (const key in out) {
        obj[key] = await scrubOutput(out[key]);
      }
      return obj;
    }
  }
  return out;
};

Comlink.expose(async (code: string) => {
  try {
    const out = await new Function(code)();
    return [true, await scrubOutput(out)];
  } catch (e) {
    return [false, e instanceof Error ? e.message : e];
  }
});
