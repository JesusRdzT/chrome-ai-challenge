import {
	BaseComponents,
	getSelectionBoundingRect
} from "./dom-utils.js";
import { LanguageAssistantModel } from "./gemini.js";

function createDialogNearSelection(selectedText) {
	document.querySelector(".ext-dialog-box")?.remove();

	const { left, bottom } = getSelectionBoundingRect();
	const dialog = BaseComponents.Dialog({
		style: {
			left: `${window.scrollX + left}px`,
			top: `${window.scrollY + bottom + 8}px`
		},
		parent: document.body
	}); 

	const header = dialog.querySelector("#ext-dialog-header");
	const body = dialog.querySelector("#ext-dialog-content");
	const footer = dialog.querySelector("#ext-dialog-footer");

	const dropdownRow = document.createElement("div");
    dropdownRow.id = "translation-dropdown-row";
    dropdownRow.className = "ext-row";
    dropdownRow.style.margin = "1rem 0"; 

	const container = document.createElement("div");
	container.className = "dropdown-container";
	container.style.display = "none";

	const searchInput = document.createElement("input");
	searchInput.type = "text";
	searchInput.placeholder = "Learn the meaning in...";
	searchInput.className = "dropdown-search-input";
	searchInput.autocomplete = "off";
	searchInput.spellcheck = false;
	searchInput.autocapitalize = "off";
	searchInput.autocorrect = "off";

	const dropdownOptions = document.createElement("div");
	dropdownOptions.className = "dropdown-options";

	const languages = [
		{ value: "chinese", label: "Chinese" },
		{ value: "english", label: "English" },
		{ value: "french", label: "French" },
		{ value: "german", label: "German" },
		{ value: "italian", label: "Italian" },
		{ value: "japanese", label: "Japanese" },
		{ value: "korean", label: "Korean" },
		{ value: "maltese", label: "Maltese" },
		{ value: "polish", label: "Polish" },
		{ value: "portuguese", label: "Portuguese" },,
		{ value: "romanian", label: "Romanian" },
		{ value: "russian", label: "Russian" },
		{ value: "spanish", label: "Spanish" },
	];

	let model; 

	function renderOptions(filter = "") {
        dropdownOptions.innerHTML = "";
        const filteredLanguages = languages.filter(lang =>
            lang.label.toLowerCase().includes(filter.toLowerCase())
        );
        filteredLanguages.forEach(lang => {
            const option = document.createElement("div");
            option.textContent = lang.label;
            option.className = "dropdown-option";
            option.addEventListener("click", async () => {
                dropdownOptions.style.display = "none";
                searchInput.placeholder = lang.label; // Update placeholder with selected language
                const translation = await model.translateText(selectedText, lang.value);
                body.textContent = translation;
            });
            dropdownOptions.appendChild(option);
        });
    }


	renderOptions();

	searchInput.addEventListener("focus", () => {
		dropdownOptions.style.display = "block"; 
	});

	
	searchInput.addEventListener("input", (e) => {
		renderOptions(e.target.value); 
	});


	document.addEventListener("click", (e) => {
		if (!container.contains(e.target)) {
			dropdownOptions.style.display = "none"; 
		}
	});
	
	container.appendChild(searchInput);
    container.appendChild(dropdownOptions);

    dropdownRow.appendChild(container);

    body.parentNode.insertBefore(dropdownRow, footer);

	LanguageAssistantModel.create().then((loadedModel) => {
        model = loadedModel; 
        container.style.display = "block";
    }).catch((error) => {
        console.error("Failed to load the language model:", error);
    });


	return { dialog, header, body, footer };
}


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

export async function startDefinitionExperience(text) {
	const { dialog, header, body, footer } = createDialogNearSelection(text);

	// Adds the title of the word or phrase to define to the header
	BaseComponents.Text({
		text: text,
		level: "h2",
		parent: header
	});

	const loader = BaseComponents.Loader()
		.appendTo(body);

	const model = await LanguageAssistantModel.create();
	const definition = await model.defineWord(text);

	loader.node.remove();

	BaseComponents.Text({
		text: definition,
		parent: body 
	});

	const options = [
		TRIGGER_OPTIONS.defineAgain,
		TRIGGER_OPTIONS.giveExample
	];

	options.forEach(({ text, action }) => BaseComponents.Button({
		text,
		onclick: () => triggerPopup(action),
		classList: "ext-btn-primary",
		parent: footer
	}));
}


export async function startExamplesExperience(text) {
	const { dialog, header, body, footer } = createDialogNearSelection();

	// Adds the title of the word or phrase to define to the header
	BaseComponents.Text({
		text: text,
		level: "h2",
		parent: header
	});

	const loader = BaseComponents.Loader()
		.appendTo(body);

	const model = await LanguageAssistantModel.create();
	const example = await model.getExample(text);

	loader.node.remove();

	BaseComponents.Text({
		text: example,
		parent: body 
	});

	const options = [
		TRIGGER_OPTIONS.define,
		TRIGGER_OPTIONS.giveMoreExamples
	];

	options.forEach(({ text, action }) => BaseComponents.Button({
		text,
		onclick: () => triggerPopup(action),
		classList: "ext-btn-primary",
		parent: footer
	}));
}

function triggerPopup(action) {
	if (!action) return;
	chrome.runtime.sendMessage({ action });
}
