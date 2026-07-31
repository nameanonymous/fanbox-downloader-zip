//コンテキスト表示
chrome.contextMenus.create({
  id: "fbdl",
  title: "このページを保存",
  type: "normal",
  contexts: ["page"],
  documentUrlPatterns: [
    "https://*.fanbox.cc/posts/*",
    "https://*.fanbox.cc/*/posts/*",
  ],
  /*,
    'onclick' : function(info){
      chrome.extention.sendMessage({type: 'get'});
    }*/
});

//選択時のイベント
chrome.contextMenus.onClicked.addListener(function (info, tab) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { message: "getImage" });
  });
});

//直リンに出来ない物は一度storageに投げた方がよさそう
chrome.runtime.onMessage.addListener(function (request) {
  if (request.type == "download") {
    console.log(request.filename);
    download(request.url, request.filename);
  } else if (request.type == "blob") {
    console.log(request.filename);
    const blob = URL.createObjectURL(request.blob);
    download(blob, request.filename);
  } else if (request.type == "set") {
    chrome.runtime.openOptionsPage(); //background.jsから発火する必要がある
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
      // ダウンロードが完了/失敗するまでは revoke しない（早すぎると DL が壊れる）
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
