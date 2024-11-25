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

    BaseComponents.Text({
        text: text,
        level: "h2",
        parent: header
    });

    const model = await LanguageAssistantModel.create();

    // Show loader before async operation
    model.showLoader(body);

    try {
        const definition = await model.defineWord(text);
        body.innerHTML = ""; // Clear content
        BaseComponents.Text({ text: definition, parent: body });
    } catch (error) {
        body.innerHTML = "";
        BaseComponents.Text({
            text: "Failed to fetch the definition. Please try again later.",
            parent: body
        });
        console.error("Error loading definition:", error);
    } finally {
        // Hide loader after async operation
        model.hideLoader();
    }

    const options = [
        {
            text: "See Other Definitions",
            action: async () => {
                await startDefinitionExperience(text);
            }
        },
        {
            text: "Give Me an Example",
            action: () => startExamplesExperience(text)
        }
    ];

    options.forEach(({ text, action }) => {
        BaseComponents.Button({
            text,
            onclick: action,
            classList: "ext-btn-primary",
            parent: footer
        });
    });
}


export async function startExamplesExperience(text) {
    const { dialog, header, body, footer } = createDialogNearSelection(text);

    BaseComponents.Text({
        text: text,
        level: "h2",
        parent: header
    });

    const model = await LanguageAssistantModel.create();

    // Show loader before async operation
    model.showLoader(body);

    try {
        const example = await model.getExample(text);
        body.innerHTML = ""; // Clear content
        BaseComponents.Text({ text: example, parent: body });
    } catch (error) {
        body.innerHTML = "";
        BaseComponents.Text({
            text: "Failed to fetch the example. Please try again later.",
            parent: body
        });
        console.error("Error loading example:", error);
    } finally {
        // Hide loader after async operation
        model.hideLoader();
    }

    const options = [
        {
            text: "See Definitions",
            action: () => startDefinitionExperience(text)
        },
        {
            text: "Give Me More Examples",
            action: async () => {
                await startExamplesExperience(text);
            }
        }
    ];

    options.forEach(({ text, action }) => {
        BaseComponents.Button({
            text,
            onclick: action,
            classList: "ext-btn-primary",
            parent: footer
        });
    });
}