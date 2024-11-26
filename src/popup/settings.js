async function handleReaderSettingsSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const settings = {};

  for (const element of form.elements) { element.disabled = true; }

  for (const [key, value] of formData.entries()) {
    settings[key] = value;
  }

  await chrome.storage.sync.set({ readerSettings: settings });

  for (const element of form.elements) {
    element.disabled = false;
  }

  const status = document.getElementById('status');
  status.textContent = "Settings saved!";
  setTimeout(() => {
    status.textContent = '';
  }, 1000);
}


async function testVoice() {
  const voiceName = document.getElementById('voiceName')?.value;
  if (!voiceName) return;
  console.log(document.getElementById('pitch')?.value);

  const pitch = parseFloat(document.getElementById('pitch')?.value) || 1;
  const rate = parseFloat(document.getElementById('rate')?.value) || 1;

  console.log(voiceName, pitch, rate);

  chrome.tts.speak(
    "This is a test of your Text-To-Speech settings",
    {
      voiceName,
      pitch,
      rate
    }
  );
}


async function setupReaderSettings() {
  const form = document.getElementById('reader-settings-form');
  form.addEventListener('submit', handleReaderSettingsSubmit);
  // Disables the form while the saved settings are being loaded
  for (const element of form.elements) { element.disabled = true; }

  // Fetches the reader settings
  const { readerSettings } = await chrome.storage.sync.get("readerSettings");
  const settings = readerSettings || {};

  // Sets all the inputs values
  for (const [key, value] of Object.entries(settings)) {
    if (!form.elements[key]) continue;
    form.elements[key].value = value;
  }

  // Configures the voice options
  const voices = (await chrome.tts.getVoices()).filter(voice => voice.lang === 'en-US');
  const voiceSelect = form.elements['voiceName'];
  for (const voice of voices) {
    const option = document.createElement('option');
    option.value = voice.voiceName;
    option.textContent = voice.voiceName;
    option.selected = voice.voiceName === settings.voiceName;
    voiceSelect.appendChild(option);
  }
  const voicetest = document.getElementById('voice-test');
  voicetest?.addEventListener('click', testVoice);

  // Enables the form inputs
  for (const element of form.elements) { element.disabled = false; }
}


window.addEventListener('load', function() {
  setupReaderSettings();
});
