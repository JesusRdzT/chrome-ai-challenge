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
  // Only show system messages if they are errors
  if (role === 'system' && isError) return null;

  const message = document.createElement("div");
  message.classList.add(`${role.trim()}-message`);
  if (isError) message.classList.add("error-message");
  message.innerHTML = marked(content);
  message.setAttribute("data-raw-content", content);
  message.id = id;

  const chatSection = document.getElementById("chat");
  chatSection.appendChild(message);

  return message;
}

function updateChatMessage({ id, content }) {
  const message = document.getElementById(id);
  if (!message) return;
  message.innerHTML = marked(content);
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
  addChatMessage(assistantMessage);

  await readStream(updateChatMessage);

  form.reset();

  disableForm(false);
}

async function saveSession() {
  if (!assistant) return;
  disableForm(true);
  await assistant.saveToStorage();
  disableForm(false);
}

async function handleNameInput(e) {
  if (!assistant) return;
  assistant.name = e.target.value;
}

async function loadStoredSession(sessionId) {
  console.log("loading session", sessionId);
  if (!sessionId) return;

  disableForm(true);

  try {
    assistant = await LanguageAssistantModel.Load(sessionId);
    
    clearMessages();

    for (const message of assistant.getChat()) {
      addChatMessage(message);
    }

    document.getElementById("session-name").value = assistant.name;
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

async function setup() {
  const form = document.getElementById("prompt-form");
  const promptInput = document.getElementById("promptInput");
  const saveButton = document.getElementById("save-session");
  const nameInput = document.getElementById("session-name");

  // Sets the event handlers
  form.onsubmit = handlePrompt;
  saveButton.onclick = saveSession;
  nameInput.oninput = handleNameInput;

  // Loads a session if the session param is present
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get('session');
  if (sessionId) await loadStoredSession(sessionId);

  // Focus the prompt input
  promptInput.focus();
}

window.addEventListener('load', setup);
