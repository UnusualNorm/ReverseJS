import "$std/dotenv/load.ts";

// ----- FRESH ----- //
// We techincally shouldn't toss undefined into parseInt, but it shouldn't crash the program
export const FRESH_PORT = parseInt(Deno.env.get("FRESH_PORT")!) || undefined;
export const FRESH_HOSTNAME = Deno.env.get("FRESH_HOSTNAME");

// ----- REVERSEJS ----- //
export const REVERSEJS_PASSWORD = Deno.env.get("REVERSEJS_PASSWORD") ??
  "password";
export const REVERSEJS_BUNDLER = Deno.env.get("REVERSEJS_BUNDLER");
