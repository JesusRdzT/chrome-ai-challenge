import '../content/index.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "showContextDialog",
    title: "Open Language Assistant",
    contexts: ["selection"],
  });
});

async function openContextOptions(context) {
  chrome.action.setPopup({ popup: "popup/context-menu.html" });
  await chrome.action.openPopup();
  chrome.runtime.sendMessage({
    action: "contextOptions",
    context: context,
  });
  chrome.action.setPopup({ popup: "popup/main.html" });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.selectionText && tab.id) {
    openContextOptions(info.selectionText);
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
    openContextOptions(message.context);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "prompt") {
    const { prompt, context, modal } = message;

    chrome.action.setPopup({ popup: 'popup/prompt.html' });
    await chrome.action.openPopup();

    chrome.runtime.sendMessage({
      action: "newSessionWithContext",
      prompt,
      context,
    });

    chrome.action.setPopup({ popup: "popup/main.html" });
  }

  return true;
});
