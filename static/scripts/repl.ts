onmessage = async (e) => {
  const code = e.data;
  try {
    const result = await eval(code);
    postMessage(result);
  } catch (e) {
    postMessage(`Error: ${e}`);
  }
};
