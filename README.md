# chrome-ai-challenge
Our project for the Google Chrome AI Challenge

## Authors:
- Jesus Rodriguez (Fullstack Developer)
- Rodolfo Sandoval (Fullstack Developer)
- Adrian Saldivar (Fullstack Developer)

## Intro:
This project is designed to provide instant answers and translations directly from your browser with just a click, powered by the Gemini Nano model. This extension enhances user interaction by defining or explaining specific words and offering the ability to chat with the model on the go. In this file, we will cover the installation process, functionalities, content details, and the advantages the extension offers.

## Instalation:
To install this file to run locally we we first need to:
- Follow instalation the steps in [Built-in AI Early Preview Program - Welcome and heads-up about the Prompt API - Update #1
](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0)
- Download and install [Node.js](https://nodejs.org/en) to get the required packages/dependencies. 
- The user must navigate to the main folder *chrome-ai-challenge* given by this repository.
- Type *npm install -D webpack-cli* in the console.
- Type *npx weback* to bundle all the files.
- Open Google Chrome Dev and navigate to *manage extensions*.
- Click on *Load unpacjed* in the top left corner.
- Select the *Dist folder* to add the extension to your browser.
- To visualize updates in realtime you can type *npx webpack --watch* on the console.
Now you are good to go!

## Functionalities:
The following functionalities outline the interactions users can perform to explore the extension. There are two ways to open and interact with the extension: through the Dialog Modal or the extension popup.
### Dialog Modal (Used for direct interaction from the browser)
- The user can press *cntrl + left click* on any selected text in the browser opening the modal dialog.
- The *Define and Example* options open a prompt window with the selected word, sending it directly to the Gemini model. The model responds based on the selected word and its context.
- The user can directly type any prompt from this modal, opening the prompt window for easier chatting.
### Extension Pop-up (This is the main experience)
#### Translator
- The extension popup includes a Translator that supports only the following language translations:
  - en -> es (Spanish)
  - en -> ar (Arabic)
  - en -> fr (French)
  - en -> ko (Korean)
  - en -> ru (Russian)
  - en -> zh (Chinese - Simplified)
  - en -> bn (Bengali)
  - en -> hi (Hindi)
  - en -> nl (Dutch)
  - en -> th (Thai)
  - en -> zh-Hant (Chinese - Traditional)
  - en -> de (German)
  - en -> it (Italian)
  - en -> pl (Polish)
  - en -> tr (Turkish)
  - en -> pt (Portuguese)
  - en -> vi (Vietnamese)
#### Story Teller
- The storyteller provides the model with a prompt about a word or phrase, and the model generates a story based on that input.
#### Prompt
- Users can chat directly with the model and save their sessions in a list displayed within the main interface.
- The prompt section can also be automatically opened and pre-filled via the Dialog Modal by interacting with any option.
#### Settings
- Users can adjust settings for text-to-speech voice, modify model parameters, and set a default translation language.

## Content
In this section, we will outline the files in the repository and explain their primary purposes.

