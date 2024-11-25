import '../content/index.js';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "showDialog",
        title: "Open Language Assistant",
        contexts: ["selection"],
    });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const [currentTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    if (currentTab?.id && info.selectionText) {
        chrome.tabs.sendMessage(currentTab.id, { action: "dialogOpen", text: info.selectionText });
    }
});

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "showMain" });
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Received message:", message);

    if (message.action === "openPopup") {
        chrome.action.setPopup({ popup: "popup/index.html" });
        chrome.action.openPopup();
    }

    chrome.runtime.sendMessage(message);
});
