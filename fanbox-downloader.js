// fanbox-downloader

// Default rename macros (fixed — no options page)
const DEFAULT_MACRO =
  "fanbox-downloader/$fanboxname$($fanboxID$)/[$YYYY28$$MM28$$DD28$_$hh28$$mm$]$fanboxname$($fanboxID$) - $Title$($PageID$)";
const DEFAULT_MACRO2 =
  "fanbox-downloader/$fanboxname$($fanboxID$)/[$YYYY28$$MM28$$DD28$_$hh28$$mm$]$fanboxname$($fanboxID$) - $Title$($PageID$) [$Diff$ - $DiffCount$]";
const DEFAULT_MACRO3 =
  "fanbox-downloader/$fanboxname$($fanboxID$)/[$YYYY28$$MM28$$DD28$_$hh28$$mm$]$fanboxname$($fanboxID$) - $Title$($PageID$) - $AttrName$";

// Fixed download settings — all options are always on
const SETTINGS = {
  savetext: true,
  saveattr: true,
  zipdownload: true,
  macro: DEFAULT_MACRO,
  macro2: DEFAULT_MACRO2,
  macro3: DEFAULT_MACRO3,
};

// Unique Functions
// Get Page Information
function getfanboxName() {
  Name = document.querySelector("h1 a").text;
  return repFilename(Name);
}

function getfanboxID() {
  if (location.hostname == "www.fanbox.cc") {
    s = location.pathname.match(/(?<=@)(.*)(?=\/posts)/); // everything after @
    return s[0];
  } else {
    return location.hostname.replace(".fanbox.cc", ""); // otherwise the subdomain is the ID
  }
}

function getPageID() {
  pageID = location.pathname.match(/(?<=\/posts\/)[0-9]*/);
  return pageID[0];
}

function getTitle() {
  title = document.querySelector("article h1").textContent;
  return repFilename(title);
}

function getDiff() {
  let a = document.querySelector(".DraftEditor-root");
  if (a == null) {
    a = document
      .querySelector("article")
      .querySelectorAll(".PostImage__Anchor-sc-xvj0xk-1");
  } else {
    a = document
      .querySelector(".DraftEditor-root")
      .querySelectorAll(".PostImage__Wrapper-sc-xvj0xk-0");
  }
  a = a.length;
  return ("" + a).padStart(2, "0");
}

function getSrcURL(getnum) {
  let a = document.querySelector(".DraftEditor-root"); //figure
  if (a == null) {
    a = document
      .querySelector("article")
      .querySelectorAll(".PostImage__Anchor-sc-xvj0xk-1")
      [getnum].getAttribute("href");
  } else {
    a = document
      .querySelector(".DraftEditor-root")
      .querySelectorAll(".PostImage__Wrapper-sc-xvj0xk-0")
      [getnum].querySelector("a")
      .getAttribute("href");
  }
  return a;
}

function getText() {
  if (document.querySelector(".sc-16ys89y-0")) {
    text = document.querySelector(".sc-16ys89y-0").innerHTML;
  } else if (document.querySelector(".Body__PostBodyText-sc-16ys89y-0")) {
    text = document.querySelector(".Body__PostBodyText-sc-16ys89y-0").innerHTML;
  } else if (
    document.querySelectorAll(
      ".public-DraftStyleDefault-block.public-DraftStyleDefault-ltr"
    )
  ) {
    s = document.querySelectorAll(
      ".public-DraftStyleDefault-block.public-DraftStyleDefault-ltr"
    );
    const texts = [];

    for (var num = 0; num < s.length; num++) {
      texts.push(s[num].textContent);
    }
    text = texts.join("\n");
  }
  return text;
}
function dlText(collect) {
  if (getText() != "") {
    const filename = getFilename(-1) + ".txt";
    if (collect) {
      collect.push({ text: getText(), filename: filename });
      return;
    }
    const blob2 = new Blob([getText()], { type: "text/plain" });
    if (isChrominum() == true) {
      console.log("SetFlag: Chrominum");
      const blob3 = URL.createObjectURL(blob2);
      console.log(blob3);
      getFile("download", blob3, filename);
      //URL.revokeObjectURL(blob3)
    } else {
      chrome.runtime.sendMessage({
        type: "blob",
        blob: blob2,
        filename: filename,
      });
    }
  }
}

async function dlAttr(collect) {
  Attr = document.querySelectorAll("[download]");
  if (Attr != null) {
    for (var num = 0; num < Attr.length; num++) {
      s2 = Attr[num].getAttribute("href");
      t = Attr[num].getAttribute("download");
      query = getFilename(-2) + "." + getExttype(s2);
      filename = query.replaceAll("$AttrName$", t);
      if (collect) {
        collect.push({ url: s2, filename: filename });
        continue;
      }
      getFile("download", s2, filename);
      await new Promise((s) => {
        setTimeout(s, 150);
      });
    }
  }
}

async function dlimg(collect) {
  diff = getDiff();
  for (var num = 0; num < diff; num++) {
    const url = getSrcURL(num);
    console.log(url);
    const filename = getFilename(num) + "." + getExttype(url);
    console.log(filename);
    if (collect) {
      collect.push({ url: url, filename: filename });
      continue;
    }
    await new Promise((s) => {
      getFile("download", url, filename);
      setTimeout(s, 150);
    });
  }
}

async function dlZip(str) {
  const items = [];
  await dlimg(items);
  if (str.savetext == true) {
    dlText(items);
  }
  if (str.saveattr == true) {
    await dlAttr(items);
  }
  const zipname = getFilename(-1) + ".zip";
  chrome.runtime.sendMessage({ type: "zip", items: items, zipname: zipname });
}

function getDate(query, custom) {
  if (getDateSourceMethod1() != (undefined && null)) {
    replaced = getDateSourceMethod1();
  } else if (getDateSourceMethod2() != (undefined && null)) {
    replaced = getDateSourceMethod2();
  } else {
    replaced = ["", 1970, 0, 1, 0, 0];
  }
  if (custom & (replaced[4] < 4)) {
    // 28h notation: before 4am counts as the previous day, +24h
    replaced[3] = parseInt(replaced[3]) - 1;
    replaced[4] = parseInt(replaced[4]) + 24;
  }
  dates = new Date(replaced[1], replaced[2], replaced[3]); // for correction
  replaced = [
    replaced[0],
    dates.getFullYear().toString(),
    (parseInt(dates.getMonth()) + 1).toString(),
    dates.getDate().toString(),
    replaced[4].toString(),
    replaced[5].toString(),
  ];
  return replaced[query].padStart(2, "0");
}

function getDateSourceMethod1() {
  try {
    let src = document.querySelector(
      ".styled__PostHeadBottom-sc-1vjtieq-3"
    ).innerText;
    replaced = /(\d+)年(\d+)月(\d+)日 (\d+):(\d+)/.exec(src);
    replaced[2] = parseInt(replaced[2]) - 1;
    return replaced;
  } catch (error) {
    return undefined;
  }
}

function getDateSourceMethod2() {
  try {
    let src = document.querySelector(".sc-1vjtieq-3").innerText;
    replaced = /(\d+)年(\d+)月(\d+)日 (\d+):(\d+)/.exec(src);
    replaced[2] = parseInt(replaced[2]) - 1;
    return replaced;
  } catch (error) {
    return undefined;
  }
}

// Common Functions
//
function getFilename2(query) {
  // Macro substitution
  query = query.replaceAll("$fanboxname$", getfanboxName());
  query = query.replaceAll("$fanboxID$", getfanboxID());
  query = query.replaceAll("$Title$", getTitle());
  query = query.replaceAll("$PageID$", getPageID());
  query = query.replaceAll("$YYYY$", getDate(1));
  query = query.replaceAll("$YY$", getDate(1).slice(-2));
  query = query.replaceAll("$MM$", getDate(2));
  query = query.replaceAll("$DD$", getDate(3));
  query = query.replaceAll("$hh$", getDate(4));
  query = query.replaceAll("$YYYY28$", getDate(1, true));
  query = query.replaceAll("$YY28$", getDate(1, true).slice(-2));
  query = query.replaceAll("$MM28$", getDate(2, true));
  query = query.replaceAll("$DD28$", getDate(3, true));
  query = query.replaceAll("$hh28$", getDate(4, true));
  query = query.replaceAll("$mm$", getDate(5));
  query = query.replaceAll("$NYYYY28$", getDateNow(1, true));
  query = query.replaceAll("$NYY28$", getDateNow(1, true).slice(-2));
  query = query.replaceAll("$NMM28$", getDateNow(2, true));
  query = query.replaceAll("$NDD28$", getDateNow(3, true));
  query = query.replaceAll("$Nhh28$", getDateNow(4, true));
  query = query.replaceAll("$Nmm$", getDateNow(5));
  // Strip leading whitespace from the filename
  return query.replace(/(^\s+)/g, "");
}

function repFilename(query) {
  hyp_src = [":", "/", "\\", "*", "?", '"', "<", ">", "|"];
  hyp_rep = ["：", "／", "￥", "＊", "？", "”", "＜", "＞", "｜"];
  for (i = 0; i < hyp_src.length; i++) {
    query = query.replaceAll(hyp_src[i], hyp_rep[i]);
  }
  return query.replace(/(^\s+)/g, "");
}
function getFilename(diff) {
  let query;
  if ((getDiff() > 1) & (diff >= 0)) {
    query = getFilename2(macro2);
    query = query.replaceAll("$DiffCount$", getDiff());
    query = query.replaceAll("$Diff$", ("" + (diff + 1)).padStart(2, "0"));
  } else if ((getDiff() == 1) | (diff == -1)) {
    query = getFilename2(macro);
  } else if (diff == -2) {
    query = getFilename2(macro3);
  }
  return query;
}

// Determine the extension from the URI
function getExttype(URL) {
  return URL.split("/").reverse()[0].split(".")[1];
}

function getFile(type, url, filename) {
  chrome.runtime.sendMessage({
    type: type,
    url: url,
    filename: filename,
  });
}

function isChrominum() {
  const s = chrome.runtime.getURL("");
  if (/chrome/.test(s) == true) {
    return true;
  } else return false;
}

function getDateNow(query, custom) {
  dateNow = new Date(Date.now());
  //dateNow = new Date (2023,7 -1 ,1,0,15,23);

  replaced = [
    dateNow,
    dateNow.getFullYear().toString(),
    (dateNow.getMonth() + 1).toString(),
    dateNow.getDate().toString(),
    dateNow.getHours().toString(),
    dateNow.getMinutes().toString(),
  ];
  if (custom & (replaced[4] < 4)) {
    // 28h notation: before 4am, keep the date correction but push the clock +24h
    customDate = new Date(replaced[1], replaced[2] - 1, replaced[3] - 1); // for correction
    replaced = [
      dateNow, // keep the raw value as-is
      customDate.getFullYear().toString(),
      (customDate.getMonth() + 1).toString(),
      customDate.getDate().toString(),
      (dateNow.getHours() + 24).toString(),
      dateNow.getMinutes().toString(),
    ];
  }
  return replaced[query].padStart(2, "0");
}

async function main(str) {
  globalThis.macro = str.macro;
  globalThis.macro2 = str.macro2;
  globalThis.macro3 = str.macro3;

  if (str.zipdownload == true) {
    console.log("Enabled ZipDownload");
    await dlZip(str);
    return;
  }

  await dlimg();

  if (str.savetext == true) {
    console.log("Enabled SaveText");
    dlText();
  }
  if (str.saveattr == true) {
    console.log("Enabled SaveAttributes");
    await dlAttr();
  }
}

// Floating "Download" button
// Shown on fanbox.cc post pages instead of a right-click context menu.
const BUTTON_ID = "fanbox-downloader-button";

function isPostPage() {
  return /\/posts\/[0-9]+/.test(location.pathname);
}

function createButton() {
  if (document.getElementById(BUTTON_ID)) return document.getElementById(BUTTON_ID);

  const button = document.createElement("button");
  button.id = BUTTON_ID;
  button.type = "button";
  Object.assign(button.style, {
    position: "fixed",
    left: "50%",
    bottom: "24px",
    transform: "translateX(-50%)",
    zIndex: "2147483647",
    width: "200px",
    height: "44px",
    padding: "0",
    backgroundColor: "#1a73e8",
    color: "#ffffff",
    border: "none",
    borderRadius: "22px",
    fontSize: "14px",
    fontWeight: "bold",
    fontFamily: "sans-serif",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    cursor: "pointer",
    overflow: "hidden",
  });

  const fill = document.createElement("div");
  fill.className = "fbdl-fill";
  Object.assign(fill.style, {
    position: "absolute",
    top: "0",
    left: "0",
    bottom: "0",
    width: "0%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    transition: "width 0.2s ease-out",
    pointerEvents: "none",
  });

  const label = document.createElement("span");
  label.className = "fbdl-label";
  label.textContent = "Download";
  Object.assign(label.style, {
    position: "relative",
    zIndex: "1",
  });

  button.appendChild(fill);
  button.appendChild(label);

  button.addEventListener("mouseenter", () => {
    if (!button.disabled) button.style.backgroundColor = "#1558b0";
  });
  button.addEventListener("mouseleave", () => {
    if (!button.disabled) button.style.backgroundColor = "#1a73e8";
  });
  button.addEventListener("click", onDownloadClick);

  document.body.appendChild(button);
  return button;
}

// How long to wait for the background script's "zipDone" signal before giving up
// and re-enabling the button anyway, in case a message gets lost.
const ZIP_PROGRESS_TIMEOUT_MS = 5 * 60 * 1000;

async function onDownloadClick() {
  const button = document.getElementById(BUTTON_ID);
  const fill = button.querySelector(".fbdl-fill");
  const label = button.querySelector(".fbdl-label");

  function setProgress(percent) {
    fill.style.width = percent + "%";
  }

  button.disabled = true;
  button.style.backgroundColor = "#1558b0";
  button.style.cursor = "default";
  setProgress(0);
  label.textContent = "Downloading...";

  let onProgressMessage;
  const waitForCompletion = new Promise((resolve) => {
    const timeoutId = setTimeout(resolve, ZIP_PROGRESS_TIMEOUT_MS);
    onProgressMessage = function (request) {
      if (request.type == "zipProgress") {
        const percent = request.total ? Math.round((request.done / request.total) * 100) : 0;
        setProgress(percent);
        label.textContent = `Downloading... ${percent}%`;
      } else if (request.type == "zipDone") {
        clearTimeout(timeoutId);
        resolve();
      }
    };
    chrome.runtime.onMessage.addListener(onProgressMessage);
  });

  try {
    await main(SETTINGS);
    await waitForCompletion;
  } catch (error) {
    console.log("fanbox-downloader: download failed", error);
    alert("fanbox-downloader: couldn't find a post to download on this page.");
  } finally {
    chrome.runtime.onMessage.removeListener(onProgressMessage);
    setProgress(0);
    button.disabled = false;
    button.style.backgroundColor = "#1a73e8";
    button.style.cursor = "pointer";
    label.textContent = "Download";
  }
}

function updateButtonVisibility() {
  const button = createButton();
  button.style.display = isPostPage() ? "block" : "none";
}

// fanbox.cc is a single-page app, so the URL can change without a page reload
(function watchLocationChanges() {
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    window.dispatchEvent(new Event("fanbox-downloader:locationchange"));
  };
  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    window.dispatchEvent(new Event("fanbox-downloader:locationchange"));
  };
  window.addEventListener("popstate", () => {
    window.dispatchEvent(new Event("fanbox-downloader:locationchange"));
  });
  window.addEventListener("fanbox-downloader:locationchange", updateButtonVisibility);
})();

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", updateButtonVisibility);
} else {
  updateButtonVisibility();
}
