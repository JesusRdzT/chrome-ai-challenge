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
		const stream = await this.session.promptStreaming(
			this.DEFINITION_TEMPLATE.replace(":word", word),
		);

		return stream;
	}

	async defineWord(word) {
		const definition = await this.session.prompt(
			this.DEFINITION_TEMPLATE.replace(":word", word),
		);

		return definition;
	}

	async getExample(word) {
		const example = await this.session.prompt(
			this.EXAMPLE_TEMPLATE.replace(":word", word),
		);

		return example;
	}

	async getExampleStream(word) {
		const stream = await this.session.promptStreaming(
			this.EXAMPLE_TEMPLATE.replace(":word", word),
		);

		return stream
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
