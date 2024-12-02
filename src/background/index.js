import '../content/content.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "showContextDialog",
    title: "Open Language Assistant",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.selectionText && tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: "showContextDialog",
      context: info.selectionText,
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "showMain" });
  }
});

let isCtrlPressed = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "keyEvent") {
    isCtrlPressed = message.keyPressed;
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.active) {
    chrome.scripting.executeScript({
      target: { tabId },
      func: injectHotkeyListener,
    });
  }
});

function injectHotkeyListener() {
  let isCtrlPressed = false;

  document.addEventListener("keydown", (event) => {
    if (event.key === "Control") {
      isCtrlPressed = true;
    }
  });

  document.addEventListener("keyup", (event) => {
    if (event.key === "Control") {
      isCtrlPressed = false;
    }
  });

  document.addEventListener("mouseup", () => {
    const selectedText = window.getSelection().toString().trim();
    if (isCtrlPressed && selectedText) {
      chrome.runtime.sendMessage({
        action: "showContextDialog",
        context: selectedText,
      });
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showContextDialog" && sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, message);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "prompt") {
    const { prompt, context, modal } = message;

    chrome.storage.local.set({ prompt, context }, () => {
      const popupUrl = modal ? "popup/prompt.html?modal=true" : "popup/prompt.html";

      chrome.action.setPopup({ popup: popupUrl }, () => {
        chrome.action.openPopup();
        chrome.action.setPopup({ popup: "popup/main.html" }); // Reset to default after opening
      });
    });
  }
});





