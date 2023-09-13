const isStringArray = (obj: unknown): obj is string[] => {
  return Array.isArray(obj) && obj.every((item) => typeof item === "string");
};

onmessage = (e) => {
  const array = JSON.parse(e.data);
  if (!isStringArray(array)) {
    postMessage("Error: expected string array");
    return;
  }

  if (array.length === 0) {
    postMessage("Error: expected non-empty string array");
    return;
  }

  try {
    const cmd = new Deno.Command(array.shift()!, {
      args: array,
      stdout: "piped",
      stderr: "piped",
      stdin: "null",
    }).spawn();

    (async () => {
      const reader = cmd.stdout.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        postMessage(value);
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
        postMessage(value);
      }
      reader.releaseLock();
    })();
  } catch (e) {
    postMessage(`Error: ${e}`);
  }
};
