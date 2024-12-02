import StorytellerModel from "../content/storyteller-model.js";
import { marked } from 'marked';

function showLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
}

function hideLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
}

let model = null;

function disableForm(disabled) {
  const form = document.getElementById("story-form");
  if (form) {
    for (const el of form.elements) {
      el.disabled = disabled;
    }
  }
}

function createNewStory() {
  const storySection = document.getElementById("story-section");
  if (storySection) {
    const storyContent = storySection.querySelector("#story-content");
    if (storyContent) storyContent.innerHTML = "";
    storySection.style.display = "none"; 
  }

  const promptInputSection = document.getElementById("prompt-input-section");
  if (promptInputSection) {
    promptInputSection.style.display = "block"; 
  }
}

async function generateStory(e) {
  e.preventDefault();

  try {
    const { storyInput } = e.target.elements;
    if (!storyInput) return;

    const prompt = storyInput.value.trim();
    if (!prompt) return;

    disableForm(true);
    showLoader();

    const generatedStory = await model.generateStory(prompt);

    hideLoader();
    disableForm(false);
    e.target.reset();

    const promptInputSection = document.getElementById("prompt-input-section");
    if (promptInputSection) {
      promptInputSection.style.display = "none";
    }

    const storySection = document.getElementById("story-section");
    if (storySection) {
      storySection.style.display = "flex";
    }

    const storyContent = document.getElementById("story-content");
    if (storyContent) {
      storyContent.innerHTML = marked(generatedStory); 
    }
  } catch (error) {
    hideLoader();
    disableForm(false);
    console.error(error);

    const status = document.querySelector("#story-form #status");
    if (status) {
      status.textContent = "An error occurred while generating the story. Try again.";
    }
  }
}


window.addEventListener("load", async () => {
  try {
    model = await StorytellerModel.Create();

    const form = document.getElementById("story-form");
    if (form) {
      form.addEventListener("submit", generateStory);
    }

    const newStoryButton = document.getElementById("new-story");
    if (newStoryButton) {
      newStoryButton.addEventListener("click", createNewStory);
    }
  } catch (error) {
    console.error("Failed to initialize StorytellerModel:", error);
  }
});
