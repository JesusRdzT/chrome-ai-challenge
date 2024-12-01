import LANG from '../constants/languages.js';

const langNames = new Intl.DisplayNames(["en"], { type: "language" });

function disableForm(form, disabled) {
  for (const el of form.elements) { el.disabled = disabled; }
}

function setFormValues(form, values) {
  for (const [key, value] of Object.entries(values ?? {})) {
    if (!form.elements[key]) continue;
    form.elements[key].value = value;
  }
}

function setSelectOptions(select, options) {
  for (const option of options) {
    const optionNode = document.createElement('option');
    optionNode.value = option.value;
    optionNode.textContent = option.textContent;
    optionNode.selected = option.selected;
    select.appendChild(optionNode);
  }
}

async function testVoice() {
  const voiceName = document.getElementById('voiceName')?.value;
  if (!voiceName) return;

  const pitch = parseFloat(document.getElementById('pitch')?.value) || 1;
  const rate = parseFloat(document.getElementById('rate')?.value) || 1;

  chrome.tts.speak(
    "This is a test of your Text-To-Speech settings",
    { voiceName, pitch, rate }
  );
}

async function setupReaderSettings() {
  const form = document.getElementById('reader-settings-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const readerSettings = Object.fromEntries(formData.entries());
    await chrome.storage.sync.set({ readerSettings });

    const status = document.getElementById('status');
    status.textContent = "Settings saved!";
    setTimeout(() => { status.textContent = ''; }, 1000);
  });

  disableForm(form, true);

  // Reads and sets the saved reader settings
  const { readerSettings } = await chrome.storage.sync.get("readerSettings");
  setFormValues(form, readerSettings);

  // Configures the voice options
  const voices = (await chrome.tts.getVoices()).filter(voice => voice.lang === 'en-US');
  setSelectOptions(form.elements['voiceName'], voices.map(voice => ({
    value: voice.voiceName,
    textContent: voice.voiceName,
    selected: voice.voiceName === readerSettings.voiceName
  })));

  const voicetest = document.getElementById('voice-test');
  voicetest?.addEventListener('click', testVoice);

  disableForm(form, false);
}

async function setupTranslatorSettings() {
  const form = document.getElementById("translator-settings-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const translatorSettings = Object.fromEntries(new FormData(e.target).entries());
    await chrome.storage.sync.set({ translatorSettings });

    const status = document.getElementById('status');
    status.textContent = "Settings saved!";
    setTimeout(() => { status.textContent = ''; }, 1000);
  });

  disableForm(form, true);

  // Reads and sets the saved translator settings
  const { translatorSettings } = await chrome.storage.sync.get("translatorSettings");
  setFormValues(form, translatorSettings);

  setSelectOptions(form.elements["targetLanguage"], LANG.map(lang => ({
    value: lang,
    textContent: langNames.of(lang),
    selected: lang === translatorSettings.targetLanguage
  })));

  disableForm(form, false);
}

async function setupPromptSettings() {
  const form = document.getElementById("prompt-settings-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const promptSettings = Object.fromEntries(new FormData(e.target).entries());
    await chrome.storage.sync.set({ promptSettings });

    const status = document.getElementById('status');
    status.textContent = "Settings saved!";
    setTimeout(() => { status.textContent = ''; }, 1000);
  });

  disableForm(form, true);

  // Reads and sets the saved prompt settings
  const { promptSettings } = await chrome.storage.sync.get("promptSettings");
  setFormValues(form, promptSettings);

  disableForm(form, false);
}


window.addEventListener('load', function() {
  setupReaderSettings();
  setupTranslatorSettings();
  setupPromptSettings();
});
