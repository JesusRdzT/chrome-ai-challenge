import { getSelectionBoundingRect } from "./dom-utils.js";

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

// Sends a message to open the main dialog when the prompt form is submitted.
function handlePromptSubmit(e) {
  e.preventDefault();
  const prompt = e.target.elements.prompt?.value;
  const context = e.target.elements.context?.value;

  if (!prompt) return;

  chrome.runtime.sendMessage({
    action: "prompt",
    prompt,
    context,
  });
}

// Sends a message to the main dialog when a quick action is clicked.
function performAction({ action, context }) {
  chrome.runtime.sendMessage({
    action,
    context,
  });
}

export function showAssistantDialog(context) {
  document.querySelector(".ext-dialog-box")?.remove();

  const { left, bottom } = getSelectionBoundingRect();

  // Creates dialog box
  const dialog = document.createElement("div");
  dialog.classList.add("ext-dialog-box");
  dialog.style.left = `${window.scrollX + left}px`;
  dialog.style.top = `${window.scrollY + bottom + 8}px`;

  // Close button
  const closeBtn = document.createElement("button");
  closeBtn.classList.add("close-btn");
  closeBtn.innerText = "x";
  closeBtn.onclick = () => dialog.remove();
  dialog.appendChild(closeBtn);

  document.body.appendChild(dialog);

  // Container for the dialog elements
  const col = document.createElement("div");
  col.classList.add("ext-col");
  dialog.appendChild(col);

  // Title of the word or phrase
  const title = document.createElement("h2");
  title.classList.add("ext-text");
  title.innerText = context;
  col.appendChild(title);

  // Prompt section
  const promptSection = document.createElement("div");
  promptSection.classList.add("ext-col");

  // Prompt label
  const promptLabel = document.createElement("label");
  promptLabel.htmlFor = "prompt";
  promptLabel.innerText = "What would you like to know?";
  promptLabel.classList.add("prompt-label");
  promptSection.appendChild(promptLabel);

  // Default options for the selection
  const optionsRow = document.createElement("div");
  optionsRow.classList.add("ext-options-row");

  // Dot-separated options
  const options = [TRIGGER_OPTIONS.define, TRIGGER_OPTIONS.giveExample];
  const optionsContainer = document.createElement("div");
  optionsContainer.classList.add("options-container");

  options.forEach(({ text, action }, index) => {
    const btn = document.createElement("button");
    btn.classList.add("ext-btn-secondary");
    btn.innerText = text;
    btn.onclick = () => performAction({ action, context });
    optionsContainer.appendChild(btn);

    // Add a dot separator unless it's the last option
    if (index < options.length - 1) {
      const dot = document.createElement("span");
      dot.innerText = "•";
      dot.classList.add("option-dot");
      optionsContainer.appendChild(dot);
    }
  });

  optionsRow.appendChild(optionsContainer);

  // Append optionsRow below the label
  promptSection.appendChild(optionsRow);

  // Prompt form
  const promptForm = document.createElement("form");
  promptForm.onsubmit = handlePromptSubmit;
  promptForm.style.display = "flex";

  const promptInput = document.createElement("input");
  promptInput.id = "prompt";
  promptInput.name = "prompt";
  promptInput.type = "text";
  promptInput.placeholder = "Type your prompt here";
  promptInput.classList.add("dropdown-search-input");
  promptForm.appendChild(promptInput);

  const contextInput = document.createElement("input");
  contextInput.type = "hidden";
  contextInput.name = "context";
  contextInput.value = context;
  promptForm.appendChild(contextInput);

  const submitBtn = document.createElement("button");
  submitBtn.innerText = "Submit";
  submitBtn.type = "submit";
  submitBtn.classList.add("ext-btn-submit");
  promptForm.appendChild(submitBtn);

  // Append promptForm to promptSection
  promptSection.appendChild(promptForm);

  // Append promptSection to dialog
  dialog.appendChild(promptSection);

  console.log("finished setup");
}