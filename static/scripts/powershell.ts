const cmd = new Deno.Command("powershell", {
  stdout: "piped",
  stderr: "piped",
  stdin: "piped",
}).spawn();

const decoder = new TextDecoder();
(async () => {
  const reader = cmd.stdout.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    postMessage(decoder.decode(value));
  }
  reader.releaseLock();
})();

(async () => {
  const reader = cmd.stderr.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    postMessage(decoder.decode(value));
  }
  reader.releaseLock();
})();

const encoder = new TextEncoder();
let writer = cmd.stdin.getWriter();
onmessage = async (e) => {
  const text = encoder.encode(e.data);
  await writer.write(text);
};

(async () => {
  while (true) {
    await writer.closed;
    writer.releaseLock();
    writer = cmd.stdin.getWriter();
  }
})();
