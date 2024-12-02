import { marked } from 'marked';
import LanguageAssistantModel from '../content/gemini.js';

let assistant = null;

function disableForm(disabled) {
  const form = document.getElementById("prompt-form");
  for (const el of form.elements) {
    el.disabled = disabled;
  }
}

/**
 * Adds a message component to the chat
 * @param {import('../content/gemini').SessionMessage} message
 * @returns {HTMLElement | null} the message element or null if the message is a system message
 */
function addChatMessage({ id, role, content }) {
  const isError = id.startsWith('error-');
  if (role === 'system' && !isError) return null;

  const message = document.createElement("div");
  const title = document.createElement("div");
  const messageContent = document.createElement("div");

  message.classList.add(`${role.trim()}-message`);
  if (isError) message.classList.add("error-message");

  title.classList.add("message-title");
  title.innerHTML = `<b>${role === 'user' ? 'User' : role === 'assistant' ? 'Gemini Nano' : 'System'}</b>`;

  messageContent.classList.add("message-content");
  messageContent.innerHTML = marked(content);
  messageContent.setAttribute("data-raw-content", content);

  message.appendChild(title);
  message.appendChild(messageContent);
  message.id = id;

  const chatSection = document.getElementById("chat");
  chatSection.appendChild(message);

  message.style.opacity = 0;
  setTimeout(() => {
    message.style.opacity = 1;
    message.style.transition = "opacity 0.3s ease-in-out";
  }, 0);

  chatSection.scrollTop = chatSection.scrollHeight;

  return message;
}


function updateChatMessage({ id, content }) {
  const message = document.getElementById(id);
  if (!message) return;

  const messageContent = message.querySelector(".message-content");
  if (messageContent) {
    messageContent.innerHTML = marked(content);
  }
}


function clearMessages() {
  const chatSection = document.getElementById("chat");
  chatSection.innerHTML = "";
}

async function handlePrompt(e) {
  e.preventDefault();

  const form = e.target;
  const { promptInput } = form.elements;
  if (!promptInput?.value) return;

  disableForm(true);

  if (!assistant) {
    assistant = await LanguageAssistantModel.Create();
  }

  const {
    userMessage,
    assistantMessage,
    readStream
  } = await assistant.promptStreaming(promptInput.value);

  addChatMessage(userMessage);
  const message = addChatMessage(assistantMessage);

  await readStream(updateChatMessage, (e) => {
    message.remove();
    console.log("error message", e);
    addChatMessage(e);
  });

  form.reset();

  disableForm(false);
}

async function saveSession() {
  const buttonIcon = document.getElementById("bookmark-icon");
  if (!assistant) return;
  if (await assistant.isSaved()) {
    await assistant.deleteFromStorage();
    buttonIcon.src = "icons/mark.png";
  } else {
    await assistant.saveToStorage();
    buttonIcon.src = "icons/bookmark.png";
  }
}

async function handleNameInput(e) {
  if (!assistant) return;
  await assistant.setName(e.target.value);
}

async function loadStoredSession(sessionId) {
  if (!sessionId) return;

  disableForm(true);

  try {
    assistant = await LanguageAssistantModel.Load(sessionId);
    clearMessages();
    assistant.getChat().forEach(addChatMessage);
    document.getElementById("session-name").value = assistant.getName();
    document.getElementById("bookmark-icon").src = "icons/bookmark.png";
  } catch(e) {
    console.log("could not load session", e);
  }

  disableForm(false);
}

chrome.runtime.onMessage.addListener((message) => {
  const { action, context, sessionId } = message;

  switch (action) {
    case 'loadSession': {
      window.location.search = `?session=${sessionId}`;
      setup();
      break;
    }
    case 'newSessionWithContext': {
      if (!context) return;

      break;
    }
    default: break;
  }
});

let isSetupComplete = false; 

async function setup() {
  if (isSetupComplete) return;
  isSetupComplete = true;

  const form = document.getElementById("prompt-form");
  const saveButton = document.getElementById("save-session");
  const nameInput = document.getElementById("session-name");

  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const isModal = urlParams.get("modal") === "true";

  if (sessionId) {
    await loadStoredSession(sessionId);
  } else if (isModal) {
    chrome.storage.local.get(["prompt", "context"], async ({ prompt, context }) => {
      if (prompt) {
        await autoSendPrompt(prompt, context);
      }
    });
  }

  // Set up event listeners
  form.removeEventListener("submit", handlePrompt);
  form.addEventListener("submit", handlePrompt);

  saveButton.removeEventListener("click", saveSession);
  saveButton.addEventListener("click", saveSession);

  nameInput.removeEventListener("input", handleNameInput);
  nameInput.addEventListener("input", handleNameInput);
}



async function autoSendPrompt(prompt, context) {
  if (!prompt) return;

  disableForm(true);

  if (!assistant) {
    assistant = await LanguageAssistantModel.Create();
  }

  const { userMessage, assistantMessage, readStream } = await assistant.promptStreaming(prompt);

  addChatMessage({ ...userMessage, context });
  const message = addChatMessage({ ...assistantMessage, context });

  await readStream(updateChatMessage, (e) => {
    message.remove();
    addChatMessage(e);
  });

  disableForm(false);
}


window.addEventListener("load", setup);
