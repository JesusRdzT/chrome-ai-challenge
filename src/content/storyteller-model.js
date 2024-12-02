/**
 * @typedef {'formal' | 'neutral' | 'casual'} AIWriterTone
 */

/**
 * @typedef {'plain-text' | 'markdown'} AIWriterFormat
 */

/**
 * @typedef {'short' | 'medium' | 'long'} AIWriterLength
 */

export default class StorytellerModel {
  #SHARED_CONTEXT = "You are a writing pal. Your goal is to write content that could help the user to learn english. From beginner with simple stories to technical with articles, short stories, reviews, etc. Write engaging content based on each request. All your responses should be written in english. You could use markdown for your responses";

  #model = window.ai?.languageModel;
  #session = null;

  async init() {
    if (!this.#model) {
      throw new Error("Writer model is not available on this device");
    }

    const { available } = await this.#model.capabilities();

    if (available === "no") {
      throw new Error("Writer model is not available on this device");
    }

    this.#session = await this.#model.create({
      systemPrompt: this.#SHARED_CONTEXT
    });
  }

  async generateStory(prompt) {
    const story = await this.#session.prompt(prompt);
    return story;
  }

  static async Create() {
    const model = new StorytellerModel();
    await model.init();
    return model;
  }
}
