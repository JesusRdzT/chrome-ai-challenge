import StorytellerModel from "../content/storyteller-model.js";
import { marked } from 'marked';

let model = null;

function disableForm(disabled) {
  const form = document.getElementById("story-form");
  for (const el of form.elements) { el.disabled = disabled; }
}

function createNewStory() {
  const storySection = document.getElementById("story-section");
  storySection.querySelector("#story-content").innerHTML = "";
  storySection.style.display = "none";

  const prompt = document.getElementById("prompt-section");
  prompt.style.display = "block";
}

async function generateStory(e) {
  e.preventDefault();

  try {
    const { story } = e.target.elements;
    const prompt = story.value;

    disableForm(true);

    const generatedStory = await model.generateStory(story.value);

    disableForm(false);
    e.target.reset();

    const promptSection = document.getElementById("prompt-section");
    promptSection.style.display = "none";

    const storySection = document.getElementById("story-section");
    storySection.style.display = "block";

    const storyContent = document.getElementById("story-content");
    storyContent.innerHTML = marked(generatedStory);
  } catch (e) {
    disableForm(false);

    console.log(e);

    const status = document.querySelector("#story-form #status");
    status.innerHTML = "An error occurred while generating the story. Try again";
  }

}

window.addEventListener("load", async () => {
  try {
    model = await StorytellerModel.Create();

    const form = document.getElementById("story-form");
    form.addEventListener("submit", generateStory);

    const button = document.getElementById("new-story");
    button.addEventListener("click", createNewStory)
  } catch (e) {
    console.error(e);
  }
});
