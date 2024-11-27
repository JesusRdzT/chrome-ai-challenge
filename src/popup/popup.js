chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const code = document.createElement("pre");
  code.innerText = JSON.stringify(message, null, 2);
  document.body.appendChild(code);
});

function setupPromptSection() {
  const sessions = [] // TODO: Get from storage

  const promptSection = document.getElementById("prompt-section");
  promptSection.innerHTML = "";

  if (sessions.length > 0) {
    const ul = document.createElement("ul");
    ul.id = "saved-sessiones-list";

    sessions.forEach((session, index) => {
      const li = document.createElement("li");
      li.innerText = session.name;
      li.addEventListener("click", () => {
      });
      ul.appendChild(li);
    });

    promptSection.appendChild(ul);

  } else {
    const p = document.createElement("p");
    p.innerText = "No sessions found";
    promptSection.appendChild(p);
  }
}

window.addEventListener("load", () => {
  setupPromptSection();

});
