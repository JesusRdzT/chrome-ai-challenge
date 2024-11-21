import '../content/index.js';

const OPTIONS = [
	{
		id: "word_definition",
		title: "Define this",
		contexts: ["selection"]
	},
	{
		id: "examples",
		title: "Give me one example with this",
		contexts: ["selection"]
	}
];

chrome.runtime.onInstalled.addListener(() => {
	for (const option of OPTIONS) {
		chrome.contextMenus.create(option);
	}
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	const [tabb] = await chrome.tabs.query({active: true, lastFocusedWindow: true});

	if (tabb?.id && info.selectionText) {
		if (info.menuItemId === "word_definition") {
			await chrome.tabs.sendMessage(tabb.id, { action: "dialogDefine", text: info.selectionText });
		}
		if (info.menuItemId === "examples") {
			await chrome.tabs.sendMessage(tabb.id, { action: "dialogExample", text: info.selectionText });
		}
	}
});

// When the extension icon is clicked, the main experience is triggered
chrome.action.onClicked.addListener((tab) => {
	chrome.tabs.sendMessage(tab.id, { action: "showMain" });
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	chrome.action.setPopup({ popup: "popup/index.html" });
	await chrome.action.openPopup();
	chrome.runtime.sendMessage(message);
});
