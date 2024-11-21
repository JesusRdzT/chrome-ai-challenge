export class SpeechSynthesis {
	constructor() {
		this.synth = window.speechSynthesis;
		this.voices = this.synth.getVoices();
		this.voice = this.voices.find(voice => voice.lang === "en-US");
	}
	
	speak(text) {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.lang = "en-US";
		utterance.rate = 0.8;
		utterance.pitch = 0;
		utterance.voice = this.voice;
		this.synth.speak(utterance);
	}
}
