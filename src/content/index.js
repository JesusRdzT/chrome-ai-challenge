import { showAssistantDialog } from './modal-dialog.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "showContextDialog") {
    showAssistantDialog(message.context);
  }
});
