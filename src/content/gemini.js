class LanguageAssistantModel {
    constructor() {
        this.model = window.ai.languageModel;
        this.session = null;
        this.SYSTEM_TEMPERATURE = 1;
        this.SYSTEM_TOP_K = 8;
        this.SHARED_CONTEXT = `You are a language reference assistant for the English language. You will be asked to define words or phrases and provide a definition or context of what they mean. You must fit all your responses within 100 words.`;
        this.DEFINITION_TEMPLATE = `Give me one definition for ":word"`;
        this.EXTRA_DEFINITION = `Give me a different definition for ":word"`;
        this.EXAMPLE_TEMPLATE = 'Give me one example with ":word"';
        this.loader = null;
    }

    async init() {
        this.session = await this.model.create({
            systemPrompt: this.SHARED_CONTEXT,
            temperature: this.SYSTEM_TEMPERATURE,
            topK: this.SYSTEM_TOP_K,
            initialPrompts: []
        });
        return this;
    }

    /**
     * Displays a loader on the screen.
     * @param {HTMLElement} parent - The parent element where the loader should be added.
     */
    showLoader(parent) {
        if (!parent) {
            console.error("Parent element is null or undefined");
            return;
        }

        // Create a loader using BaseComponents.Loader
        this.loader = document.createElement("div");
        this.loader.className = "ext-spinner"; // Ensure this matches your CSS for the spinner
        parent.appendChild(this.loader); // Append loader to the parent
        console.log("Loader displayed:", this.loader);
    }

    /**
     * Hides and removes the loader from the screen.
     */
    hideLoader() {
        if (this.loader && this.loader.parentElement) {
            this.loader.remove(); // Remove loader from the DOM
            console.log("Loader removed:", this.loader);
            this.loader = null; // Reset the reference
        }
    }

    /**
     * Fetches a definition for a word.
     * @param {string} word - The word to define.
     * @returns {Promise<string>} - The definition of the word.
     */
    async defineWord(word) {
        try {
            return await this.session.prompt(
                this.DEFINITION_TEMPLATE.replace(":word", word)
            );
        } catch (error) {
            console.error(`Error defining word "${word}":`, error);
            return `Unable to provide a definition for "${word}". Please try again later.`;
        }
    }

    /**
     * Fetches an example for a word.
     * @param {string} word - The word to get an example for.
     * @returns {Promise<string>} - An example using the word.
     */
    async getExample(word) {
        try {
            return await this.session.prompt(
                this.EXAMPLE_TEMPLATE.replace(":word", word)
            );
        } catch (error) {
            console.error(`Error getting example for "${word}":`, error);
            return `Unable to provide an example for "${word}". Please try again later.`;
        }
    }

    /**
     * Fetches a definition stream for a word.
     * @param {string} word - The word to define.
     * @returns {Promise<ReadableStream>} - The stream containing the definition.
     */
    async defineWordStream(word) {
        try {
            return await this.session.promptStreaming(
                this.DEFINITION_TEMPLATE.replace(":word", word)
            );
        } catch (error) {
            console.error(`Error streaming definition for "${word}":`, error);
            throw new Error(`Unable to stream definition for "${word}".`);
        }
    }

    /**
     * Fetches an example stream for a word.
     * @param {string} word - The word to get an example for.
     * @returns {Promise<ReadableStream>} - The stream containing the example.
     */
    async getExampleStream(word) {
        try {
            return await this.session.promptStreaming(
                this.EXAMPLE_TEMPLATE.replace(":word", word)
            );
        } catch (error) {
            console.error(`Error streaming example for "${word}":`, error);
            throw new Error(`Unable to stream example for "${word}".`);
        }
    }

    /**
     * Creates an instance of the LanguageAssistantModel.
     * @returns {Promise<LanguageAssistantModel>} - A new instance of the LanguageAssistantModel.
     */
    static async create() {
        const instance = new LanguageAssistantModel();
        await instance.init();
        return instance;
    }
}

export { LanguageAssistantModel };
