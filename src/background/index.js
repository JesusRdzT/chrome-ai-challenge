import '../content/index.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "showContextDialog",
    title: "Open Language Assistant",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

  if (currentTab?.id && info.selectionText) {
    chrome.tabs.sendMessage(
      currentTab.id,
      {
        action: "showContextDialog",
        context: info.selectionText
      }
    );
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "showMain" });
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  chrome.action.setPopup({ popup: "popup/index.html" });
  await chrome.action.openPopup();
  chrome.runtime.sendMessage(message);
});
