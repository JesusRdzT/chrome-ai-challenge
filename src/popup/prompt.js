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
  //if (role === 'system' && !isError) return null;

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
  const { promptInput, contextInput } = form.elements;
  if (!promptInput?.value) return;

  disableForm(true);

  const context = contextInput.value ?? null;
  if (!assistant) {
    assistant = await LanguageAssistantModel.Create(context);

    if (context) {
      const chat = assistant.getChat();
      chat.forEach(addChatMessage);
    }
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



let isSetupComplete = false; 

async function setup() {
  if (isSetupComplete) return;
  isSetupComplete = true;

  const form = document.getElementById("prompt-form");
  const saveButton = document.getElementById("save-session");
  const nameInput = document.getElementById("session-name");

  // Set up event listeners
  form.addEventListener("submit", handlePrompt);
  saveButton.addEventListener("click", saveSession);
  nameInput.addEventListener("input", handleNameInput);
  
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session");
  const context = urlParams.get("context");

  if (sessionId) {
    await loadStoredSession(sessionId);
  } else if (context) {
    const prompt = urlParams.get("prompt");
    startContextSession(context, prompt);
  }
}

async function startContextSession(context, prompt) {
  if (!context || !prompt) return;
  const form = document.getElementById("prompt-form");
  const { promptInput, contextInput } = form.elements;
  promptInput.value = prompt;
  contextInput.value = context;
  form.requestSubmit();
}

chrome.runtime.onMessage.addListener((message) => {
  const { action } = message;

  switch (action) {
    case 'loadSession': {
      const { sessionId } = message;
      window.location.search = `?session=${sessionId}`;
      break;
    }
    case 'newSessionWithContext': {
      const { context, prompt } = message;
      if (!context || !prompt) return;

      window.location.search = `?modal=true&context=${context}&prompt=${prompt}`;

      break;
    }
    default: break;
  }
});

window.addEventListener("load", setup);
