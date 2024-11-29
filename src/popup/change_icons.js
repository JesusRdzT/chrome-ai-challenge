document.addEventListener("DOMContentLoaded", function () {
    const saveButton = document.getElementById("save-session");
  
    if (!saveButton) return;
  
    saveButton.addEventListener("click", function () {
      const bookmarkIcon = this.querySelector("img");
  
      if (!bookmarkIcon) return;
  
      bookmarkIcon.src = "icons/bookmark.png";
  
      this.disabled = true; 
    });
  
    const bookmarkIcon = saveButton.querySelector("img");
  
    if (bookmarkIcon) {
      bookmarkIcon.src = "icons/mark.png"; 
    }
  });
  