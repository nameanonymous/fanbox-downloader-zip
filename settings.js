function save_settings() {
  var txt = document.getElementById("txt").checked;
  var attr = document.getElementById("attr").checked;
  var zipdownload = document.getElementById("zipdownload").checked;
  var macro = document.getElementById("macro").value;
  var macro2 = document.getElementById("macro2").value;
  var macro3 = document.getElementById("macro3").value;
  chrome.storage.local.set(
    {
      savetext: txt,
      saveattr: attr,
      zipdownload: zipdownload,
      macro: macro,
      macro2: macro2,
      macro3: macro3,
    },
    function () {
      console.log("Done: save_settings()");
    }
  );
}

function load_settings() {
  chrome.storage.local.get(
    ["savetext", "saveattr", "zipdownload", "macro", "macro2", "macro3"],
    function (load) {
      document.getElementById("txt").checked = load.savetext;
      document.getElementById("attr").checked = load.saveattr;
      document.getElementById("zipdownload").checked = load.zipdownload;
      document.getElementById("macro").value = load.macro;
      document.getElementById("macro2").value = load.macro2;
      document.getElementById("macro3").value = load.macro3;
      if (load.macro == undefined) {
        initialize_settings();
        console.log("Initializing Settings");
        return null;
      }
      console.log("Done: load_settings()");
    }
  );
}
function clear_settings() {
  chrome.storage.local.clear(function () {
    console.log("Done: reset_settings()");
    location.reload();
  });
}

function initialize_settings() {
  document.getElementById("txt").checked = true;
  document.getElementById("attr").checked = true;
  document.getElementById("zipdownload").checked = false;
  document.getElementById("macro").value =
    "fanbox-downloader/$fanboxname$($fanboxID$)/[$YYYY28$$MM28$$DD28$_$hh28$$mm$]$fanboxname$($fanboxID$) - $Title$($PageID$)";
  document.getElementById("macro2").value =
    "fanbox-downloader/$fanboxname$($fanboxID$)/[$YYYY28$$MM28$$DD28$_$hh28$$mm$]$fanboxname$($fanboxID$) - $Title$($PageID$) [$Diff$ - $DiffCount$]";
  document.getElementById("macro3").value =
    "fanbox-downloader/$fanboxname$($fanboxID$)/[$YYYY28$$MM28$$DD28$_$hh28$$mm$]$fanboxname$($fanboxID$) - $Title$($PageID$) - $AttrName$";
  save_settings();
}

document.addEventListener("DOMContentLoaded", load_settings);
document.getElementById("save").addEventListener("click", save_settings);
document.getElementById("reset").addEventListener("click", initialize_settings);
document.getElementById("reload").addEventListener("click", load_settings);
