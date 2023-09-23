globalThis.addEventListener("unhandledrejection", (e) => e.preventDefault());

while (true) {
  const socket = new WebSocket(`ws://127.0.0.1:8000/client`);
  socket.addEventListener("message", (code) => eval(code.data));

  await new Promise((resolve) => socket.addEventListener("close", resolve));
  await new Promise((resolve) => setTimeout(resolve, 5000));
}
