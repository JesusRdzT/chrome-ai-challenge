import LANG_CODES from '../constants/languages.js';

const langName = new Intl.DisplayNames(["en"], { type: "language" });
let translator = null;
let languagePair = {
  sourceLanguage: "en",
  targetLanguage: "es"
};

function setLanguageOptions(selectElement, options) {
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = langName.of(option);
    optionElement.selected = option === languagePair[selectElement.id];
    selectElement.appendChild(optionElement);
  });
}

async function prepareTranslator() {
  console.log("new lang pair", languagePair);
  const canTranslate = await window.translation.canTranslate(languagePair);
  if (canTranslate === "no") return;

  translator = await window.translation.createTranslator(languagePair);
  await window.translation.ready;
}

async function changeLanguage(e) {
  languagePair[e.target.id] = e.target.value;
  await prepareTranslator();

  const textarea = document.querySelector(`#${e.target.id}TextArea`);

  if (e.target.id === "targetLanguage") {
    const sourceTextArea = document.getElementById("sourceLanguageTextArea");
    textarea.value = await translator.translate(sourceTextArea.value);
  }

  textarea.placeholder = await translator.translate("Enter text to translate");
}

async function swapLanguages() {
  const sourceSelect = document.getElementById("sourceLanguage");
  const targetSelect = document.getElementById("targetLanguage");
  const sourceTextArea = document.getElementById("sourceLanguageTextArea");
  const targetTextArea = document.getElementById("targetLanguageTextArea");

  const sourceValue = sourceSelect.value;
  const targetValue = targetSelect.value;

  const sourceOptions = sourceSelect.innerHTML;
  sourceSelect.innerHTML = targetSelect.innerHTML;
  targetSelect.innerHTML = sourceOptions;

  sourceSelect.value = targetValue;
  targetSelect.value = sourceValue;

  const sourcePlaceholder = sourceTextArea.placeholder;
  sourceTextArea.placeholder = targetTextArea.placeholder;
  targetTextArea.placeholder = sourcePlaceholder;

  const sourceTextValue = sourceTextArea.value;
  sourceTextArea.value = targetTextArea.value;
  targetTextArea.value = sourceTextValue;

  const targetLang = languagePair.targetLanguage;
  languagePair.targetLanguage = languagePair.sourceLanguage;
  languagePair.sourceLanguage = targetLang;

  await prepareTranslator();
}

async function onTargetInput(e) {
  const targetTextArea = document.getElementById("targetLanguageTextArea");
  targetTextArea.value = await translator.translate(e.target.value);
}

async function setup() {
  const sourceSelect = document.getElementById("sourceLanguage");
  const targetSelect = document.getElementById("targetLanguage");
  const swapButton = document.getElementById("swap-button");
  const sourceTextArea = document.getElementById("sourceLanguageTextArea");

  const { translatorSettings } = await chrome.storage.sync.get("translatorSettings");
  if (translatorSettings) {
    languagePair.targetLanguage = translatorSettings.targetLanguage;
  }

  setLanguageOptions(sourceSelect, ["en"]);
  setLanguageOptions(targetSelect, LANG_CODES);

  sourceSelect.addEventListener("change", changeLanguage);
  targetSelect.addEventListener("change", changeLanguage);
  swapButton.addEventListener("click", swapLanguages);
  sourceTextArea.addEventListener("input", onTargetInput);

  await prepareTranslator();
}

window.addEventListener("load", () => {
  setup();
});
