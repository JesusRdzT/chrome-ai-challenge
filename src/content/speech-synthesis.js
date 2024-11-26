/**
 * @typedef {Object} ReaderSettings
 * @property {number} rate
 * @property {number} pitch
 * @property {string} voiceName
 */


export class TextReader {

  /** @type {ReaderSettings} */
  #settings = {
    rate: 1,
    pitch: 1,
    voiceName: "Google US English",
  };


  /**
   * 
   * @param {ReaderSettings} settings
   */
  setSettings(settings) {
    this.#settings = {
      rate: parseFloat(settings.rate) || 1,
      pitch: parseFloat(settings.pitch) || 1,
      voiceName: settings.voiceName || "Google US English",
    };
  }
	
  /**
   * @param {string} text
   * @param {function} onEvent
   * @param {function} onFinish
   */
	speak(text, onEvent = null, onFinish = null) {	
    console.log(this.#settings, onEvent, onFinish);
    chrome.tts.speak(
      text,
      {
        ...this.#settings,
        onEvent
      },
      onFinish
    );
	}


  /**
   * Creates an instance of `TextReader` with the user settings for the utterance.
   */
  static async Default() {
    const reader = new TextReader();
    const { readerSettings } = await chrome.storage.sync.get("readerSettings");
    reader.setSettings(readerSettings);
    return reader;
  }
}
