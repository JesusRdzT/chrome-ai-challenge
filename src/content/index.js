import { startMainExperience } from './main-popup.js';
import {
    startDefinitionExperience,
    startExamplesExperience
} from './dialog-popup.js';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "dialogOpen") {
        startDefinitionExperience(message.text);
    } else if (message.action === "showMain") {
        startMainExperience();
    } else if (message.action === "dialogExample") {
        startExamplesExperience(message.text);
    }
});
