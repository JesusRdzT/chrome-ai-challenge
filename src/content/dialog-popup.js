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

    // Adds the title of the word or phrase to define to the header
    BaseComponents.Text({
        text: text,
        level: "h2",
        parent: header
    });

    async function loadDefinition(word, isAlternate = false) {
        const loader = BaseComponents.Loader().appendTo(body); 
        body.innerHTML = ""; 
        try {
            const model = await LanguageAssistantModel.create();
            const definition = isAlternate
                ? await model.defineWord(`Provide an alternate definition for "${word}"`)
                : await model.defineWord(word);

            loader.node.remove();
            BaseComponents.Text({ text: definition, parent: body });
        } catch (error) {
            loader.node.remove();
            BaseComponents.Text({ text: "Failed to fetch definition. Please try again.", parent: body });
            console.error("Error loading definition:", error);
        }
    }

    await loadDefinition(text);

    const options = [
        {
            text: "See Other Definitions",
            action: async () => {
                await loadDefinition(text, true);
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

    async function loadExample(word, isAdditional = false) {
        const loader = BaseComponents.Loader().appendTo(body); 
        body.innerHTML = "";

        try {
            const model = await LanguageAssistantModel.create();
            const example = isAdditional
                ? await model.getExample(`Provide another example for "${word}"`)
                : await model.getExample(word);

            loader.node.remove(); 
            BaseComponents.Text({ text: example, parent: body });
        } catch (error) {
            loader.node.remove();
            BaseComponents.Text({ text: "Failed to fetch example. Please try again.", parent: body });
            console.error("Error loading example:", error);
        }
    }

  
    await loadExample(text);

    const options = [
        {
            text: "See Definitions",
            action: () => startDefinitionExperience(text) 
        },
        {
            text: "Give Me More Examples",
            action: async () => {
                await loadExample(text, true);
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
