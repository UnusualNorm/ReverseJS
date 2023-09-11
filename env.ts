// ----- FRESH ----- //
// We techincally shouldn't toss undefined into parseInt, but it shouldn't crash the program
// @ts-expect-error - parseInt can take undefined
export const PORT = parseInt(Deno.env.get("PORT")) || undefined;
export const HOSTNAME = Deno.env.get("HOST");

// ----- REVERSEJS ----- //
export const PASSWORD = Deno.env.get("PASSWORD") ?? "password";
