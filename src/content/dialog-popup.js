import {
	BaseComponents,
	getSelectionBoundingRect
} from "./dom-utils.js";
import { LanguageAssistantModel } from "./gemini.js";


function createDialogNearSelection() {
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
	const { dialog, header, body, footer } = createDialogNearSelection();

	// Adds the title of the word or phrase to define to the header
	BaseComponents.Text({
		text: text,
		level: "h2",
		parent: header
	})

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
	}))
}

export async function startExamplesExperience(text) {
	const { dialog, header, body, footer } = createDialogNearSelection();

	// Adds the title of the word or phrase to define to the header
	BaseComponents.Text({
		text: text,
		level: "h2",
		parent: header
	})

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
	}))
}

function triggerPopup(action) {
	if (!action) return;
	chrome.runtime.sendMessage({ action });
}
