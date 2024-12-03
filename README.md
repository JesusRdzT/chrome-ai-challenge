# chrome-ai-challenge
Our project for the Google Chrome AI Challenge

## Authors:
- Jesus Rodriguez (Fullstack Developer)
- Rodolfo Sandoval (Fullstack Developer)
- Adrian Saldivar (Fullstack Developer)

## Intro:
This project is designed to provide instant answers and translations directly from your browser with just a click, powered by the Gemini Nano model. This extension enhances user interaction by defining or explaining specific words and offering the ability to chat with the model on the go. In this file, we will cover the installation process, functionalities, content details, and the advantages the extension offers.

## Installation:
To install this project to run locally we we first need to:
- Follow the setup steps in [Built-in AI Early Preview Program - Welcome and heads-up about the Prompt API - Update #1
](https://docs.google.com/document/d/1VG8HIyz361zGduWgNG7R_R8Xkv0OOJ8b5C9QKeCjU0c/edit?tab=t.0)
- Download and install [Node.js](https://nodejs.org/en) to get the required packages/dependencies. 
- The user must navigate to the main folder **chrome-ai-challenge** given by this repository.
- Type **npm install -D webpack-cli** in the console.
- Type **npm run watch** to bundle all the files.
- Open Google Chrome Dev and navigate to **manage extensions**.
- Click on **Load unpacked** in the top left corner.
- Select the **Dist folder** to add the extension to your browser.
- To visualize updates in realtime you can type **npx webpack --watch** on the console.
Now you are good to go!

## Functionalities:
The following functionalities outline the interactions users can perform to explore the extension. There are two ways to open and interact with the extension: through the context menu or the extension popup.
### Context Menu (Used for direct interaction from the browser)
- The **Define and Example** options open a prompt window with the selected word, sending it directly to the Gemini model. The model responds based on the selected word and its context.
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
In this section, we will outline the files in the repository and explain their primary purposes from the **src** folder. In the format **(Folder -> File)**
### Background folder
#### background -> index.js
- This file contains the background script for the Chrome extension, which manages event listeners and interactions between the browser and the extension.
### Constants folder
#### constants -> languages.js
- This file declares the languages available for the translator.
### Content folder
#### content -> gemini.js
- This file defines a Language Assistant Model that serves as the core logic for handling sessions, messages, and interactions with a language model (Gemini Nano). 
### Popup folder
#### popup -> context-menu.js
- This file manages the creation and interaction of an Assistant Dialog Menu, allowing users to perform actions like defining words or generating examples for selected text. It dynamically constructs the dialog, and enables interactions through predefined actions or custom prompts.
#### popup -> popup.js
- This file handles displaying and managing saved sessions and the overall (Main Experience). It includes a message listener for debugging, a deleteSession function to remove sessions from storage, and setupPromptSection to dynamically list saved sessions with options to reopen or delete them, initializing the list on page load.
#### popup -> prompt.js
- This file manages a chat-based interface, facilitating interactions with a language assistant. It supports real-time messaging, session management (saving, loading, and deleting sessions), and dynamic UI updates. It initializes with URL parameters for preloading sessions or automatic prompts and listens for runtime messages to handle context-based interactions.
#### popup -> settings.js
- This file manages the configuration and initialization of settings for the extension, including Text-to-Speech (TTS), translation, and prompt options. It dynamically loads saved settings from storage, populates forms with those values, and updates them upon submission. Additionally, it handles TTS voice testing, dynamically populates language and voice selection dropdowns, and provides user feedback for saving changes. Each settings section (Reader, Translator, and Prompt) is initialized during the page load.
#### popup -> translator.js
- This file manages the language translation interface. It initializes language options, dynamically updates translation settings, and handles interactions such as swapping source and target languages or translating input in real time. It uses Intl.DisplayNames for displaying language names, supports translator creation and readiness checks, and updates placeholders and text areas based on user input or language swaps. The system initializes upon page load, ensuring translation functionality is ready.

## Advantages and scalability
This project utilizes and evaluates the Gemini Nano model within a browser environment, aiming to provide seamless user navigation and an intuitive understanding of web content. The extension facilitates real-time language translation, learning, and interaction with the model, eliminating the need for typing or other less efficient input methods.

The project has potential for scalability, offering additional functionalities by leveraging the model. For instance, integrating a computer vision system could analyze the browser interface and provide on-demand pop-ups to assist users across various Google services, such as Google Cloud, Drive, and others. This data could then be converted to text and fed into Gemini Nano for enhanced interaction and guidance.
  

