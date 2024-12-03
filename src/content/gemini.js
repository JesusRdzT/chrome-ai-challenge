
/**
 * @typedef {Object} SessionMessage
 * @property {string} id - The message id
 * @property {string | null} parent - The id of the parent message
 * @property {'user' | 'system' | 'assistant'} role - The role of the message author
 * @property {string} content - The message content
 */


/**
 * Constructs a session message object
 * @param {'user' | 'system' | 'assistant'} role
 * @param {string} content
 * @param {string | null} parent
 * @param {Error} [error]
 * @returns {SessionMessage}
 */
function sessionMessage(role, content, parent = undefined, error = undefined) {
  return {
    id: `${!!error ? 'error' : 'message'}-${Date.now().toString()}`,
    role,
    content,
    parent,
    error
  };
}

/** Returns all saved sessions from storage */
export async function getSavedSessions() {
  const data = await chrome.storage.sync.get(null);
  return Object.entries(data)
    .filter(([key, value]) => key.startsWith('session-')) // Filters only session keys
    .map(([key, value]) => value); // Returns the actual content of the session
}


export default class LanguageAssistantModel {

  // ***** CONSTANTS *****
  #SYSTEM_TEMPERATURE = 1;
  #SYSTEM_TOP_K = 8;
  #SHARED_CONTEXT =  `You are a language reference assistant for the english language. You will be asked to define words or phrases and provide a definition or context of what they mean. You must fit all your responses within 100 words.`;
  #DEFINITION_TEMPLATE = `Give me one definition for ":word"`;
  #EXTRA_DEFINITION = `Give me a different definition for ":word"`;
  #EXAMPLE_TEMPLATE = 'Give me one example with ":word"';

  // ***** PROPERTIES *****
  /** The associated session id */
  #id = null;
  /** The assigned name for the session */
  #name = null;
  /** The instance of the Gemini Nano Prompt API */
  #model = window.ai.languageModel;
  #session = null;

  /** @type {SessionMessage[]} */
  #chat = [];


  constructor(sessionId) {
    this.#id = sessionId;
  }

  async init() {
    if (!!this.#id && this.#id.startsWith('session-')) {
      const data = await chrome.storage.sync.get(this.#id);
      const session = data[this.#id];

      if (!session) {
        throw new Error(`Session "${this.#id}" not found`);
      }

      this.#name = session.name;
      this.#chat = session.chat;
    }

    try {
      const { promptSettings } = await chrome.storage.sync.get('promptSettings');
      this.#SYSTEM_TEMPERATURE = promptSettings?.temperature ?? 1;
      this.#SYSTEM_TOP_K = promptSettings?.topK ?? 8;

      console.log("Settings - topk:", this.#SYSTEM_TOP_K, "  temp:", this.#SYSTEM_TEMPERATURE);
    } catch(e) {
      console.log("Error fetching storage data:", e);
    }


    this.#session = await this.#model.create({
      systemPrompt: this.#SHARED_CONTEXT,
      temperature: this.#SYSTEM_TEMPERATURE,
      topK: this.#SYSTEM_TOP_K,
      initialPrompts: this.#chat 
    });

    return this;
  }

  /** Returns the session name */
  getName() {
    return this.#name;
  }

  /** Sets the session name. Updates it in storage if the session is stored */
  async setName(name) {
    this.#name = name;
    await this.#updateIfStored();

  }

  getChat() {
    return this.#chat;
  }

  /**
   * Prompts the model and returns the model response a stream
   * @param {string} content
   */
  async promptStreaming(content) {
    const userMessage = sessionMessage('user', content);
    // Waits for 500ms
    await new Promise((resolve) => setTimeout(resolve, 500));

    const assistantMessage = sessionMessage('assistant', "...", userMessage.id);

    const stream = this.#session.promptStreaming(content)

    const readStream = async (onChunk, onError) => {
      try {
        for await (const text of stream) {
          // Updates the referenced object with the new content
          assistantMessage.content = text;
          onChunk(assistantMessage);
        }

        // The chat is only saved when the stream finishes
        this.#chat.push(userMessage);
        this.#chat.push(assistantMessage);

        await this.#updateIfStored();
      } catch (e) {
        console.error(e);
        onError(sessionMessage("system", "An error occurred while processing your request", userMessage.id, e));
      }
    }

    return { userMessage, assistantMessage, readStream };
  }

  /**
   * Submits a prompt to the model. Returns the user and assistant messages.
   * NOTE: The assistant message is a promise that, if successful, resolves to a `SessionMessage` object and adds the messages to the chat history.
   * @param {string} content
   */
  prompt(content) {
    const userMessage = sessionMessage('user', content);

    const responseTask = this.#session.prompt(content)
    .then(async (res) => {
      const msg = sessionMessage('assistant', res, userMessage.id);

      // Adds the messages to the chat history
      this.#chat.push(userMessage);
      this.#chat.push(msg);

      await this.#updateIfStored();

      return msg;
    })
    .catch((e) => {
      console.error(e);
      return sessionMessage(
        'system',
        "An error occurred while processing your request", 
        userMessage.id, 
        e
      );
    });

    return { userMessage, responseTask };
  }

  /**
   * Saves the session to storage
   */
  async saveToStorage() {
    if (!this.#id) {
      this.#id = `session-${Date.now().toString()}`;
    }

    await chrome.storage.sync.set({
      [this.#id]: {
        id: this.#id,
        name: this.#name,
        chat: this.#chat
      }
    });
  }

  /**
   * Deletes the session from storage
   */
  async deleteFromStorage() {
    if (!this.#id) return;
    await chrome.storage.sync.remove(this.#id);
  }

  /**
   * Checks if the session is saved in storage
   */
  async isSaved() {
    if (!this.#id) return false;
    const { [this.#id]: session } = await chrome.storage.sync.get(this.#id);
    return !!session;
  }

  /**
   *  Updates the session if it is saved in storage
   */
  async #updateIfStored() {
    if (await this.isSaved()) {
      await this.saveToStorage();
    }
  }

  /**
   * Creates a new language assistant session
   */ 
  static async Create() {
    const instance = new LanguageAssistantModel();
    await instance.init();
    return instance;
  }

  /**
   * Loads a language assistant session from storage.
   * By default, throws an error if the session is not found
   * @param {string} sessionId
   * @param {Object} options
   * @param {boolean} [options.throwIfNotFound=true] If false, returns null if the session is not found.
   */
  static async Load(sessionId, { throwIfNotFound = true } = {}) {
    const instance = new LanguageAssistantModel(sessionId);

    try {
      await instance.init();
    } catch (e) {
      if (throwIfNotFound === true) {
        throw e;
      }
      return null;
    }

    return instance;
  }
}
