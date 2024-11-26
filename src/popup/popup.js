chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const code = document.createElement("pre");
  code.innerText = JSON.stringify(message, null, 2);
  document.body.appendChild(code);
});
