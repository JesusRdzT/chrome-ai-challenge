import { getSelectionBoundingRect } from "./dom-utils.js";

const TRIGGER_OPTIONS = {
  define: {
    text: "Define this",
    action: "define"
  },
  defineAgain: {
    text: "See other definitions",
    action: "define"
  },
  giveExample: {
    text: "Give me an example",
    action: "example"
  },
  giveMoreExamples: {
    text: "Give me more examples",
    action: "example"
  }
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
    context 
  });
}

// Sends a message to the main dialog when a quick action is clicked.
function performAction({ action, context }) {
  chrome.runtime.sendMessage({
    action,
    context
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

  const closebtn = document.createElement("button");
  closebtn.classList.add("close-btn");
  closebtn.innerText = "x";
  closebtn.onclick = () => dialog.remove();
  dialog.appendChild(closebtn);

  document.body.appendChild(dialog);


  // Container for the dialog elements
  const col = document.createElement("div");
  col.classList.add("ext-row");
  dialog.appendChild(col);


  // Title of the word or phrase
  const title = document.createElement("h2");
  title.innerText = context;
  col.appendChild(title);

  // Default options for the selection
  const optionsrow = document.createElement("div");
  optionsrow.classList.add("ext-row");

  const options = [
    TRIGGER_OPTIONS.define,
    TRIGGER_OPTIONS.giveExample
  ];

  options.forEach(({ text, action }) => {
    const btn = document.createElement("button");
    btn.innerText = text;
    btn.onclick = () => performAction({ action, context });
    optionsrow.appendChild(btn);
  });

  dialog.appendChild(optionsrow);

  // Prompt section
  //  Prompt form
  const promptform = document.createElement("form");
  promptform.onsubmit = handlePromptSubmit;

  const promptlabel = document.createElement("label");
  promptlabel.for = "prompt";
  promptlabel.innerText = "What would you like to know?";
  promptform.appendChild(promptlabel);

  const promptinput = document.createElement("input");
  promptinput.id = "prompt";
  promptinput.name = "prompt";
  promptinput.type = "text";
  promptinput.placeholder = "Type your prompt here";
  promptform.appendChild(promptinput);

  const contextinput = document.createElement("input");
  contextinput.type = "hidden";
  contextinput.name = "context";
  contextinput.value = context;
  promptform.appendChild(contextinput);


  const submitbtn = document.createElement("button");
  submitbtn.innerText = "Submit";
  submitbtn.type = "submit";
  promptform.appendChild(submitbtn);

  //  Prompt form container
  const promptsection = document.createElement("div");
  promptsection.classList.add("ext-col");

  promptsection.appendChild(promptform);

  dialog.appendChild(promptsection);
  console.log("finished setup");
}
