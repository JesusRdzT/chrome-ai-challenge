import { getSavedSessions } from "../content/gemini.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const code = document.createElement("pre");
  code.innerText = JSON.stringify(message, null, 2);
  document.body.appendChild(code);
});

async function deleteSession(sessionId) {
  try {
    await chrome.storage.sync.remove(sessionId);
    alert(`Session "${sessionId}" has been deleted.`);
    setupPromptSection();
  } catch (e) {
    console.error("Error deleting session:", e);
    alert("An error occurred while deleting the session.");
  }
}

async function setupPromptSection() {
  try {
    const sessions = await getSavedSessions();
    const savedSessionsList = document.getElementById("saved-sessions-list");
    savedSessionsList.innerHTML = "";

    if (sessions.length > 0) {
      sessions.forEach((session, index) => {
        const li = document.createElement("li");
        li.className = "saved-session-item";

        const anchor = document.createElement("a");
        anchor.href = `prompt.html?session=${session.id}`;
        anchor.innerText = session.name ?? `Session ${index + 1}`;
        anchor.className = "session-link";
        li.appendChild(anchor);

        const deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";
        deleteButton.className = "delete-session-button";
        deleteButton.style.marginLeft = "10px"; 
        deleteButton.addEventListener("click", () => deleteSession(session.id));
        li.appendChild(deleteButton);

        savedSessionsList.appendChild(li);
      });
    } else {
      const noSessionsMessage = document.createElement("p");
      noSessionsMessage.innerText = "No sessions found";
      savedSessionsList.appendChild(noSessionsMessage);
    }
  } catch (e) {
    console.error("Error setting up prompt section:", e);
  }
}

window.addEventListener("load", () => {
  setupPromptSection();
});
