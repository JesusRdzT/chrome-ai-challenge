const TRIGGER_OPTIONS = {
  define: {
    text: "Define this",
    action: "define",
  },
  defineAgain: {
    text: "See other definitions",
    action: "define",
  },
  giveExample: {
    text: "Give me an example",
    action: "example",
  },
  giveMoreExamples: {
    text: "Give me more examples",
    action: "example",
  },
};

const handlePromptSubmit = (e) => {
  e.preventDefault();

  const values = Object.fromEntries(new FormData(e.target).entries());
  if (!values.prompt) return;
  console.log(values);
}

function performAction({ action, context }) {
  let prompt;
  if (action === "define") {
    prompt = `Define this: ${context}`;
  } else if (action === "example") {
    prompt = `Give me an example of: ${context}`;
  }

  if (!prompt) return;
  window.close();
  chrome.runtime.sendMessage({
    action: "prompt",
    prompt,
    context,
    modal: true,
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, context } = message;
  window.location.search = `?action=${action}&context=${context}`;
});

window.addEventListener("load", () => {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");

  if (action === "contextOptions") {
    const contextValue = params.get("context");
    if (!contextValue) return;

    const form = document.getElementById("prompt-form");
    form.addEventListener("submit", handlePromptSubmit);

    const { context } = form.elements;
    context.value = contextValue;

    const contextLabel = document.getElementById("context-label");
    contextLabel.textContent = contextValue;

    const actions = [TRIGGER_OPTIONS.define, TRIGGER_OPTIONS.giveExample];
    const actionContainer = document.querySelector(".options-container");

    actions.forEach(({ text, action }, index) => {
      const btn = document.createElement("button");
      btn.classList.add("ext-btn-secondary");
      btn.innerText = text;
      btn.onclick = () => performAction({ action, context: contextValue });
      actionContainer.appendChild(btn);
    });

  }
});
