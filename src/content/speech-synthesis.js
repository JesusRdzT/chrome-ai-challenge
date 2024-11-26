export class TextReader {
  #settings = {
    rate: 1,
    pitch: 1,
    voiceName: "Google US English",
  };

  setSettings(settings) {
    this.#settings = Object.assign(this.#settings, settings);
  }
	
	speak(text) {	
    chrome.tts.speak(text, {
      ...this.#settings,
    });
	}


  static async Default() {
    const reader = new TextReader();
    const { readerSettings } = await chrome.storage.sync.get("readerSettings");
    reader.setSettings(readerSettings);
    return reader;
  }
}
