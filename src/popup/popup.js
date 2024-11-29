import { getSavedSessions } from "../content/gemini.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const code = document.createElement("pre");
  code.innerText = JSON.stringify(message, null, 2);
  document.body.appendChild(code);
});

async function setupPromptSection() {
  try {
    const sessions = await getSavedSessions()// TODO: Get from storage
    const savedSessionsList = document.getElementById("saved-sessions-list");
    savedSessionsList.innerHTML = "";

    if (sessions.length > 0) {
      const ul = document.createElement("ul");
      ul.id = "saved-sessiones-list";

      sessions.forEach((session, index) => {
        const anchor = document.createElement("a");
        anchor.href = `prompt.html?session=${session.id}`;
        anchor.innerText = session.name ?? `Session ${index + 1}`;

        const li = document.createElement("li");
        li.appendChild(anchor);
        ul.appendChild(li);
      });

      savedSessionsList.appendChild(ul);

    } else {
      const p = document.createElement("p");
      p.innerText = "No sessions found";
      savedSessionsList.appendChild(p);
    }
  } catch (e) {
    console.log(e);
  }
}

window.addEventListener("load", () => {
  setupPromptSection();
});
