class LanguageAssistantModel {
	constructor() {
		this.model = window.ai.languageModel;
		this.session = null;
		this.SYSTEM_TEMPERATURE = 1;
		this.SYSTEM_TOP_K = 8;
		this.SHARED_CONTEXT =  `You are a for language reference assistant for the english language. You will be asked to define words or phrases and provide a definition or context of what they mean. You must fit all your responses within 100 words.`;
		this.DEFINITION_N_SHOT_PROMPTS = [
			
		];
		this.DEFINITION_TEMPLATE = `Give me one definition for ":word"`;
		this.EXTRA_DEFINITION = `Give me a different definition for ":word"`;
		this.EXAMPLE_TEMPLATE = 'Give me one example with ":word"';
		this.TRANSLATION_TEMPLATE = `Give me the translation and spelling of following text into :language: ":text"`;
	}

	async init() {
		this.session = await this.model.create({
			systemPrompt: this.SHARED_CONTEXT,
			temperature: this.SYSTEM_TEMPERATURE,
			topK: this.SYSTEM_TOP_K,
			initialPrompts: this.DEFINITION_N_SHOT_PROMPTS
		});
		return this;
	}

	/**
	* Asks the model to define a word and returns the stream containing the definition in realtime
	* @param {string} word - The word to define
	* @returns {Promise<ReadableStream>} - The stream containing the definition
	*/
	async defineWordStream(word) {
        try {
            const stream = await this.session.promptStreaming(
                this.DEFINITION_TEMPLATE.replace(":word", word),
            );
            return stream;
        } catch (error) {
            console.error(`Error streaming definition for "${word}":`, error);
            throw new Error(`Unable to stream definition for "${word}".`);
        }
    }

	async defineWord(word) {
        try {
            const definition = await this.session.prompt(
                this.DEFINITION_TEMPLATE.replace(":word", word),
            );
            return definition;
        } catch (error) {
            console.error(`Error defining word "${word}":`, error);
            return `Unable to provide a definition for "${word}". Please try again later.`;
        }
    }

	async getExample(word) {
        try {
            const example = await this.session.prompt(
                this.EXAMPLE_TEMPLATE.replace(":word", word),
            );
            return example;
        } catch (error) {
            console.error(`Error getting example for "${word}":`, error);
            return `Unable to provide an example for "${word}". Please try again later.`;
        }
    }

	async getExampleStream(word) {
        try {
            const stream = await this.session.promptStreaming(
                this.EXAMPLE_TEMPLATE.replace(":word", word),
            );
            return stream;
        } catch (error) {
            console.error(`Error streaming example for "${word}":`, error);
            throw new Error(`Unable to stream example for "${word}".`);
        }
    }

	async translateText(text, language) {
        const prompt = this.TRANSLATION_TEMPLATE
            .replace(":language", language)
            .replace(":text", text);

        try {
            const translation = await this.session.prompt(prompt);
            return translation;
        } catch (error) {
            if (error.name === "NotSupportedError") {
                console.warn(`Translation not supported for language: ${language}`);
                return `Translation not supported for ${language}. Please try again.`;
            } else {
                console.error("An unexpected error occurred:", error);
                throw error; 
            }
        }
    }

	static async create() {
		const instance = new LanguageAssistantModel();
		await instance.init();
		return instance;
	}

	getLanguage() {
		return this.language;
	}
}
export {
	LanguageAssistantModel
}
