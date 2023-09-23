// ----- FRESH ----- //
// We techincally shouldn't toss undefined into parseInt, but it shouldn't crash the program
export const FRESH_PORT = parseInt(Deno.env.get("FRESH_PORT")!) || undefined;
export const FRESH_HOSTNAME = Deno.env.get("FRESH_HOSTNAME");

// ----- PASTEBIN ----- //
export const PASTEBIN_API_KEY = Deno.env.get("PASTEBIN_API_KEY") ??
  "Wliffwa8DMRYSVhIdiIaqLbmka-CXWRw";

// ----- REVERSEJS ----- //
export const REVERSEJS_PASSWORD = Deno.env.get("REVERSEJS_PASSWORD") ??
  "password";
