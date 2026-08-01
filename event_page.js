// Some files can't be linked directly, so route them through the extension first
chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == "download") {
    console.log(request.filename);
    download(request.url, request.filename);
  } else if (request.type == "blob") {
    console.log(request.filename);
    const blob = URL.createObjectURL(request.blob);
    download(blob, request.filename);
  } else if (request.type == "zip") {
    downloadZip(request.items, request.zipname);
  }
  return true;
});

function download(url, filename) {
  chrome.downloads.download({
    url: url,
    filename: filename,
    saveAs: false,
  });
}

function basename(path) {
  return path.split("/").pop();
}

async function downloadZip(items, zipname) {
  const zip = new JSZip();
  const usedNames = new Set();

  function uniqueName(name) {
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
    const dot = name.lastIndexOf(".");
    const base = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    let i = 2;
    let candidate;
    do {
      candidate = `${base} (${i})${ext}`;
      i++;
    } while (usedNames.has(candidate));
    usedNames.add(candidate);
    return candidate;
  }

  for (const item of items) {
    const name = uniqueName(basename(item.filename));
    if (item.text !== undefined) {
      zip.file(name, item.text);
      continue;
    }
    try {
      const res = await fetch(item.url);
      const buf = await res.arrayBuffer();
      zip.file(name, buf);
    } catch (error) {
      console.log("ZipFetchError: " + item.url, error);
    }
  }

  const blob = await zip.generateAsync({ type: "blob" });
  const blobUrl = URL.createObjectURL(blob);
  chrome.downloads.download(
    {
      url: blobUrl,
      filename: zipname,
      saveAs: false,
    },
    function (downloadId) {
      // Don't revoke until the download finishes/fails — revoking too early breaks it
      function onChanged(delta) {
        if (delta.id !== downloadId) return;
        if (delta.state && (delta.state.current == "complete" || delta.state.current == "interrupted")) {
          URL.revokeObjectURL(blobUrl);
          chrome.downloads.onChanged.removeListener(onChanged);
        }
      }
      chrome.downloads.onChanged.addListener(onChanged);
    }
  );
}
